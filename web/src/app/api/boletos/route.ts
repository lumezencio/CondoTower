import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/boletos
 * Lista boletos gerados
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 20);
    const status = searchParams.get("status") ?? "";

    const where: any = { tenant: "parkclub" };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.boleto.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ data_vencimento: "desc" }],
        include: {
          apartamento: {
            select: {
              numero: true,
              bloco: {
                select: {
                  nome: true,
                },
              },
            },
          },
        },
      }),
      prisma.boleto.count({ where }),
    ]);

    const boletos = data.map((b: any) => ({
      ...b,
      valor: b.valor?.toNumber() || 0,
      multa: b.multa?.toNumber() || 0,
      juros: b.juros?.toNumber() || 0,
      valor_pago: b.valor_pago?.toNumber() || 0,
    }));

    return NextResponse.json({ ok: true, data: boletos, total, page, pageSize });
  } catch (e: any) {
    console.error("Erro ao listar boletos:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

/**
 * POST /api/boletos
 * Gera boletos em lote
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { boletos, mesReferencia, valorTaxa, multa, juros } = body;

    if (!boletos || !Array.isArray(boletos) || boletos.length === 0) {
      return NextResponse.json({ ok: false, message: "Nenhum boleto para salvar" }, { status: 400 });
    }

    // Buscar todas as unidades para obter os IDs dos apartamentos
    const units = await prisma.apartamento.findMany({
      where: {
        id: {
          in: boletos.map((b: any) => b.unitId),
        },
      },
      include: {
        bloco: true,
      },
    });

    const boletosCriados = [];

    for (const boletoData of boletos) {
      const apartamento = units.find(u => u.id === boletoData.unitId);
      if (!apartamento) continue;

      // Gerar código de barras e linha digitável (simplificado)
      const codigoBarras = gerarCodigoBarras(boletoData.valor, boletoData.vencimento);
      const linhaDigitavel = gerarLinhaDigitavel(codigoBarras);

      const boleto = await prisma.boleto.create({
        data: {
          apartamento_id: apartamento.id,
          referencia: mesReferencia,
          valor: boletoData.valor,
          data_vencimento: new Date(boletoData.vencimento),
          codigo_barras: codigoBarras,
          linha_digitavel: linhaDigitavel,
          url_boleto: `/boletos/${apartamento.bloco.nome}-${apartamento.numero}-${mesReferencia}.pdf`,
          status: "ABERTO",
          multa: multa,
          juros: juros,
          observacoes: `Boleto gerado em lote - ${mesReferencia}`,
        },
      });

      boletosCriados.push(boleto);
    }

    return NextResponse.json({ 
      ok: true, 
      message: `${boletosCriados.length} boletos criados com sucesso`,
      count: boletosCriados.length,
    });
  } catch (e: any) {
    console.error("Erro ao salvar boletos:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

// Funções auxiliares para gerar código de barras (simplificado)
function gerarCodigoBarras(valor: number, vencimento: string): string {
  // Em produção, usar biblioteca específica para gerar código de barras válido
  const data = new Date(vencimento);
  const fatorVencimento = Math.floor((data.getTime() - new Date('1997-10-07').getTime()) / (1000 * 60 * 60 * 24));
  const valorFormatado = Math.round(valor * 100).toString().padStart(10, '0');
  return `3419${fatorVencimento}${valorFormatado}000000000000000000000000`;
}

function gerarLinhaDigitavel(codigoBarras: string): string {
  // Em produção, usar algoritmo válido para linha digitável
  return codigoBarras.substring(0, 47).replace(/(\d{5})(\d{5})(\d{5})(\d{5})(\d{5})(\d{5})/, '$1.$2$3 $4$5.$6$7 $8$9.$01$2 $3$4$5$6$7$8');
}
