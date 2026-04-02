import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helper: map Decimal fields of a RetencaoImposto record to plain numbers
function mapRetencao(r: any) {
  return {
    ...r,
    baseCalculo: r.baseCalculo?.toNumber?.() ?? r.baseCalculo,
    aliquota: r.aliquota?.toNumber?.() ?? r.aliquota,
    valorRetido: r.valorRetido?.toNumber?.() ?? r.valorRetido,
  };
}

// Helper: map Decimal fields of a NotaEntrada record to plain numbers
function mapNota(nota: any) {
  return {
    ...nota,
    valorBruto: nota.valorBruto?.toNumber?.() ?? nota.valorBruto,
    valorLiquido: nota.valorLiquido?.toNumber?.() ?? nota.valorLiquido ?? null,
    retencoes: (nota.retencoes ?? []).map(mapRetencao),
  };
}

// =====================================================================
// Cálculo automático de retenções de impostos - Legislação Brasileira
// Baseado em:
//   - IN RFB 1.234/2012 (retenções federais PJ)
//   - Lei Complementar 116/2003 (ISS)
//   - IN RFB 971/2009 (INSS sobre serviços)
//   - Art. 30 Lei 10.833/2003 (CSLL/COFINS/PIS)
// =====================================================================

type Retencao = {
  tipoImposto: string;
  baseCalculo: number;
  aliquota: number;
  valorRetido: number;
  codigoRecolhimento: string | null;
  dataVencimento: Date;
  observacoes: string | null;
};

// Alíquotas ISS por tipo de serviço (default 5%, varia por município)
const ISS_RATES: Record<string, number> = {
  LIMPEZA: 0.05,
  SEGURANCA: 0.05,
  MANUTENCAO: 0.05,
  ELETRICA: 0.05,
  HIDRAULICA: 0.05,
  ELEVADOR: 0.05,
  TI: 0.02,
  PROFISSIONAL: 0.05,
  OUTRO: 0.05,
};

// Serviços que retêm INSS (cessão de mão de obra - Art. 31 Lei 8.212/91)
const SERVICOS_INSS = ["LIMPEZA", "SEGURANCA", "MANUTENCAO"];

/**
 * Calcula as retenções de impostos com base na legislação brasileira.
 *
 * Regras aplicadas:
 * - PF (Pessoa Física / Autônomo):
 *   • INSS: 11% (contribuição previdenciária - teto INSS 2026)
 *   • IRRF: tabela progressiva simplificada (15% para serviços > R$1.903,98)
 *   • ISS: se o município exigir
 *
 * - PJ (Pessoa Jurídica):
 *   • Se Simples Nacional: apenas ISS (quando aplicável)
 *   • Se Lucro Presumido/Real:
 *     - IRRF: 1.5% (DARF 1708 - serviços profissionais)
 *     - CSLL: 1% (Art. 30 Lei 10.833)
 *     - COFINS: 3% (Art. 30 Lei 10.833)
 *     - PIS: 0.65% (Art. 30 Lei 10.833)
 *     - ISS: conforme alíquota municipal
 *     - INSS: 11% (apenas para serviços de cessão de mão de obra)
 */
function calcularRetencoes(params: {
  valorBruto: number;
  tipoFornecedor: string; // "PJ" | "PF"
  tipoServico: string;
  simplesNacional: boolean;
}): Retencao[] {
  const { valorBruto, tipoFornecedor, tipoServico, simplesNacional } = params;
  const retencoes: Retencao[] = [];

  // Data de vencimento padrão: dia 20 do mês seguinte
  const hoje = new Date();
  const vencimento = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 20);

  if (tipoFornecedor === "PF") {
    // ===== PESSOA FÍSICA / AUTÔNOMO =====

    // INSS - 11% (contribuição do segurado - Art. 216 Dec 3.048/99)
    // Teto INSS 2026: R$ 8.157,41
    const tetoINSS = 8157.41;
    const baseINSS = Math.min(valorBruto, tetoINSS);
    const aliqINSS = 0.11;
    retencoes.push({
      tipoImposto: "INSS",
      baseCalculo: baseINSS,
      aliquota: aliqINSS,
      valorRetido: Math.round(baseINSS * aliqINSS * 100) / 100,
      codigoRecolhimento: "GPS 2100",
      dataVencimento: vencimento,
      observacoes: "INSS sobre servico de pessoa fisica - Art. 216 Dec 3.048/99",
    });

    // IRRF - Tabela progressiva (simplificado: 15% para > R$1.903,98)
    if (valorBruto > 1903.98) {
      const aliqIRRF = valorBruto > 4664.68 ? 0.275 : valorBruto > 3751.05 ? 0.225 : valorBruto > 2826.65 ? 0.15 : 0.075;
      retencoes.push({
        tipoImposto: "IRRF",
        baseCalculo: valorBruto,
        aliquota: aliqIRRF,
        valorRetido: Math.round(valorBruto * aliqIRRF * 100) / 100,
        codigoRecolhimento: "DARF 0588",
        dataVencimento: vencimento,
        observacoes: `IRRF sobre servico PF - tabela progressiva ${(aliqIRRF * 100).toFixed(1)}%`,
      });
    }

    // ISS - se aplicável
    const issRate = ISS_RATES[tipoServico] ?? 0.05;
    retencoes.push({
      tipoImposto: "ISS",
      baseCalculo: valorBruto,
      aliquota: issRate,
      valorRetido: Math.round(valorBruto * issRate * 100) / 100,
      codigoRecolhimento: null,
      dataVencimento: vencimento,
      observacoes: `ISS municipal sobre servico PF - LC 116/2003`,
    });

  } else {
    // ===== PESSOA JURÍDICA =====

    if (simplesNacional) {
      // Simples Nacional: apenas ISS retido na fonte (quando o tomador é obrigado)
      // Art. 21 LC 123/2006 - Dispensado de IRRF, CSLL, COFINS, PIS
      const issRate = ISS_RATES[tipoServico] ?? 0.05;
      retencoes.push({
        tipoImposto: "ISS",
        baseCalculo: valorBruto,
        aliquota: issRate,
        valorRetido: Math.round(valorBruto * issRate * 100) / 100,
        codigoRecolhimento: null,
        dataVencimento: vencimento,
        observacoes: "ISS retido - fornecedor Simples Nacional (unica retencao aplicavel)",
      });

    } else {
      // Lucro Presumido / Real - retenções completas

      // IRRF - 1.5% (DARF 1708 - serviços profissionais)
      // IN RFB 1.234/2012, Art. 714 RIR/2018
      retencoes.push({
        tipoImposto: "IRRF",
        baseCalculo: valorBruto,
        aliquota: 0.015,
        valorRetido: Math.round(valorBruto * 0.015 * 100) / 100,
        codigoRecolhimento: "DARF 1708",
        dataVencimento: vencimento,
        observacoes: "IRRF 1.5% sobre servicos PJ - IN RFB 1.234/2012",
      });

      // CSLL - 1% (Art. 30 Lei 10.833/2003)
      retencoes.push({
        tipoImposto: "CSLL",
        baseCalculo: valorBruto,
        aliquota: 0.01,
        valorRetido: Math.round(valorBruto * 0.01 * 100) / 100,
        codigoRecolhimento: "DARF 5952",
        dataVencimento: vencimento,
        observacoes: "CSLL 1% - Art. 30 Lei 10.833/2003",
      });

      // COFINS - 3% (Art. 30 Lei 10.833/2003)
      retencoes.push({
        tipoImposto: "COFINS",
        baseCalculo: valorBruto,
        aliquota: 0.03,
        valorRetido: Math.round(valorBruto * 0.03 * 100) / 100,
        codigoRecolhimento: "DARF 5952",
        dataVencimento: vencimento,
        observacoes: "COFINS 3% - Art. 30 Lei 10.833/2003",
      });

      // PIS - 0.65% (Art. 30 Lei 10.833/2003)
      retencoes.push({
        tipoImposto: "PIS",
        baseCalculo: valorBruto,
        aliquota: 0.0065,
        valorRetido: Math.round(valorBruto * 0.0065 * 100) / 100,
        codigoRecolhimento: "DARF 5952",
        dataVencimento: vencimento,
        observacoes: "PIS 0.65% - Art. 30 Lei 10.833/2003",
      });

      // ISS
      const issRate = ISS_RATES[tipoServico] ?? 0.05;
      retencoes.push({
        tipoImposto: "ISS",
        baseCalculo: valorBruto,
        aliquota: issRate,
        valorRetido: Math.round(valorBruto * issRate * 100) / 100,
        codigoRecolhimento: null,
        dataVencimento: vencimento,
        observacoes: `ISS ${(issRate * 100).toFixed(0)}% - LC 116/2003`,
      });

      // INSS - 11% apenas para serviços de cessão de mão de obra
      // Art. 31 Lei 8.212/91
      if (SERVICOS_INSS.includes(tipoServico)) {
        retencoes.push({
          tipoImposto: "INSS",
          baseCalculo: valorBruto,
          aliquota: 0.11,
          valorRetido: Math.round(valorBruto * 0.11 * 100) / 100,
          codigoRecolhimento: "GPS 2631",
          dataVencimento: vencimento,
          observacoes: "INSS 11% cessao de mao de obra - Art. 31 Lei 8.212/91",
        });
      }
    }
  }

  // Filtrar retenções com valor zero
  return retencoes.filter(r => r.valorRetido > 0);
}

/**
 * GET /api/notas-entrada
 * Lista notas de entrada com filtros, paginação e retenções incluídas.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);
    const status = searchParams.get("status") ?? "";
    const tipoFornecedor = searchParams.get("tipoFornecedor") ?? "";
    const tipoServico = searchParams.get("tipoServico") ?? "";
    const search = searchParams.get("search") ?? "";
    const startDate = searchParams.get("startDate") ?? "";
    const endDate = searchParams.get("endDate") ?? "";

    const where: any = { tenant: "parkclub" };

    if (status) where.status = status;
    if (tipoFornecedor) where.tipoFornecedor = tipoFornecedor;
    if (tipoServico) where.tipoServico = tipoServico;

    if (startDate || endDate) {
      where.dataEmissao = {};
      if (startDate) where.dataEmissao.gte = new Date(startDate);
      if (endDate) where.dataEmissao.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { fornecedor: { contains: search, mode: "insensitive" } },
        { descricao: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.notaEntrada.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: { retencoes: true },
      }),
      prisma.notaEntrada.count({ where }),
    ]);

    return NextResponse.json({
      ok: true,
      data: data.map(mapNota),
      total,
      page,
      pageSize,
    });
  } catch (e: any) {
    console.error("Erro ao listar notas de entrada:", e);
    return NextResponse.json(
      { ok: false, message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notas-entrada
 * Cria uma nova nota de entrada.
 * Após criar, tenta calcular as retenções de impostos via Python backend.
 * Se o backend não estiver disponível, a nota é criada com status PENDENTE.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // --- Required fields ---
    const numero = String(body?.numero ?? "").trim();
    const dataEmissao = body?.dataEmissao;
    const tipoFornecedor = String(body?.tipoFornecedor ?? "").trim();
    const fornecedor = String(body?.fornecedor ?? "").trim();
    const tipoServico = String(body?.tipoServico ?? "").trim();
    const descricao = String(body?.descricao ?? "").trim();
    const valorBruto = Number(body?.valorBruto ?? 0);

    if (!numero) {
      return NextResponse.json(
        { ok: false, message: "Número da nota é obrigatório" },
        { status: 400 }
      );
    }
    if (!dataEmissao) {
      return NextResponse.json(
        { ok: false, message: "Data de emissão é obrigatória" },
        { status: 400 }
      );
    }
    if (!tipoFornecedor) {
      return NextResponse.json(
        { ok: false, message: "Tipo de fornecedor é obrigatório" },
        { status: 400 }
      );
    }
    if (!fornecedor) {
      return NextResponse.json(
        { ok: false, message: "Fornecedor é obrigatório" },
        { status: 400 }
      );
    }
    if (!tipoServico) {
      return NextResponse.json(
        { ok: false, message: "Tipo de serviço é obrigatório" },
        { status: 400 }
      );
    }
    if (!descricao) {
      return NextResponse.json(
        { ok: false, message: "Descrição é obrigatória" },
        { status: 400 }
      );
    }
    if (!valorBruto || valorBruto <= 0) {
      return NextResponse.json(
        { ok: false, message: "Valor bruto deve ser maior que zero" },
        { status: 400 }
      );
    }

    // --- Optional fields ---
    const simplesNacional = Boolean(body?.simplesNacional ?? false);

    // Create the nota with PENDENTE status
    const nota = await prisma.notaEntrada.create({
      data: {
        tenant: "parkclub",
        numero,
        serie: body?.serie?.trim() || null,
        dataEmissao: new Date(dataEmissao),
        tipoFornecedor: tipoFornecedor as any,
        fornecedor,
        cnpjFornecedor: body?.cnpjFornecedor?.trim() || null,
        cpfFornecedor: body?.cpfFornecedor?.trim() || null,
        simplesNacional,
        tipoServico: tipoServico as any,
        descricao,
        cfop: body?.cfop?.trim() || null,
        valorBruto: valorBruto as any,
        chaveNfe: body?.chaveNfe?.trim() || null,
        observacoes: body?.observacoes?.trim() || null,
        status: "PENDENTE",
      },
      include: { retencoes: true },
    });

    // --- Cálculo automático de retenções de impostos ---
    const retencoesCalculadas = calcularRetencoes({
      valorBruto,
      tipoFornecedor,
      tipoServico,
      simplesNacional,
    });

    if (retencoesCalculadas.length > 0) {
      const totalRetido = retencoesCalculadas.reduce((sum, r) => sum + r.valorRetido, 0);
      const valorLiquido = valorBruto - totalRetido;

      await prisma.$transaction(async (tx) => {
        for (const r of retencoesCalculadas) {
          await tx.retencaoImposto.create({
            data: {
              tenant: "parkclub",
              notaEntradaId: nota.id,
              tipoImposto: r.tipoImposto as any,
              baseCalculo: r.baseCalculo as any,
              aliquota: r.aliquota as any,
              valorRetido: r.valorRetido as any,
              codigoRecolhimento: r.codigoRecolhimento,
              dataVencimento: r.dataVencimento,
              status: "PENDING",
              observacoes: r.observacoes,
            },
          });
        }

        await tx.notaEntrada.update({
          where: { id: nota.id },
          data: {
            valorLiquido: valorLiquido as any,
            status: "PROCESSADA",
          },
        });
      });

      const notaAtualizada = await prisma.notaEntrada.findUnique({
        where: { id: nota.id },
        include: { retencoes: true },
      });

      return NextResponse.json(
        { ok: true, data: mapNota(notaAtualizada) },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { ok: true, data: mapNota(nota) },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("Erro ao criar nota de entrada:", e);
    return NextResponse.json(
      { ok: false, message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
