import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { emitirDarfGratuito, formatDateBR, formatPeriodoBR } from "@/lib/fiscal/sicalc-free";
import { emitirGpsGratuito } from "@/lib/fiscal/sal-gps-free";
import { emitirIssGratuito, isNfseConfigurada } from "@/lib/fiscal/nfse-nacional-free";
import { gerarCnab240, type PagamentoCnab, type DadosEmpresa } from "@/lib/fiscal/cnab240";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/fiscal/transmitir
 *
 * Transmite GRATUITAMENTE as guias de recolhimento de uma nota de entrada.
 *
 * Body: { notaEntradaId: string }
 *
 * Fluxo automatizado:
 * 1. IRRF, CSLL, COFINS, PIS → SicalcWeb da Receita Federal (GRATUITO)
 * 2. INSS → SAL da Receita Federal (GRATUITO)
 * 3. ISS → API NFS-e Nacional gov.br (GRATUITO, requer credenciamento)
 * 4. Gera arquivo CNAB 240 para pagamento em lote no banco
 *
 * Nenhum custo. Nenhuma API paga.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const notaEntradaId = String(body?.notaEntradaId ?? "").trim();

    if (!notaEntradaId) {
      return NextResponse.json(
        { ok: false, message: "ID da nota de entrada e obrigatorio" },
        { status: 400 }
      );
    }

    const nota = await prisma.notaEntrada.findUnique({
      where: { id: notaEntradaId },
      include: { retencoes: true },
    });

    if (!nota) {
      return NextResponse.json(
        { ok: false, message: "Nota de entrada nao encontrada" },
        { status: 404 }
      );
    }

    const retencoesPendentes = nota.retencoes.filter(r => r.status === "PENDING");

    if (retencoesPendentes.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "Nenhuma retencao pendente para transmitir",
        data: { guias: [], cnab: null, resumo: { totalDarfs: 0, totalGps: 0, totalIss: 0, valorTotalGuias: 0 } },
      });
    }

    const cnpjCondominio = process.env.CNPJ_CONDOMINIO || "00.000.000/0001-00";
    const agora = new Date();
    const resultados: any[] = [];
    const pagamentosCnab: PagamentoCnab[] = [];

    for (const ret of retencoesPendentes) {
      const tipoImposto = ret.tipoImposto;
      const valorRetido = Number(ret.valorRetido);
      const dataVenc = ret.dataVencimento;

      // ===================================================================
      // DARF — IRRF, CSLL, COFINS, PIS (SicalcWeb gratuito)
      // ===================================================================
      if (["IRRF", "CSLL", "COFINS", "PIS", "OUTRO"].includes(tipoImposto)) {
        const codigoReceita = extrairCodigoReceita(ret.codigoRecolhimento, tipoImposto);

        const darf = await emitirDarfGratuito({
          documento: cnpjCondominio,
          codigoReceita,
          periodoApuracao: formatPeriodoBR(agora),
          dataVencimento: formatDateBR(dataVenc),
          valorPrincipal: valorRetido,
          numeroReferencia: nota.numero,
          observacoes: `${tipoImposto} - NF ${nota.numero} - ${nota.fornecedor}`,
        });

        resultados.push({
          retencaoId: ret.id,
          tipo: "DARF",
          imposto: tipoImposto,
          valor: valorRetido,
          codigoReceita,
          codigoBarras: darf.codigoBarras,
          linhaDigitavel: darf.linhaDigitavel,
          valorTotal: darf.valorTotal,
          valorJuros: darf.valorJuros,
          valorMulta: darf.valorMulta,
          metodo: darf.metodo,
          status: darf.ok ? "EMITIDO" : "ERRO",
          message: darf.message,
        });

        // CNAB para pagamento em lote
        pagamentosCnab.push({
          tipo: "DARF",
          codigoReceita,
          periodoApuracao: formatDateBR(agora),
          cnpjContribuinte: cnpjCondominio,
          dataVencimento: dataVenc,
          valorPrincipal: valorRetido,
          valorMulta: darf.valorMulta,
          valorJuros: darf.valorJuros,
          numeroReferencia: nota.numero,
        });

        // Salvar guia no banco
        await prisma.retencaoImposto.update({
          where: { id: ret.id },
          data: {
            guiaUrl: darf.codigoBarras ? `DARF:${darf.linhaDigitavel}` : null,
            observacoes: [
              ret.observacoes,
              `DARF ${codigoReceita} emitido em ${agora.toISOString().split("T")[0]} via ${darf.metodo}`,
              darf.codigoBarras ? `Cod.Barras: ${darf.codigoBarras}` : null,
            ].filter(Boolean).join(" | "),
          },
        });
      }

      // ===================================================================
      // GPS — INSS (SAL gratuito)
      // ===================================================================
      else if (tipoImposto === "INSS") {
        const codigoPgto = extrairCodigoGps(ret.codigoRecolhimento);

        const gps = await emitirGpsGratuito({
          cnpj: cnpjCondominio,
          codigoPagamento: codigoPgto,
          competencia: `${String(agora.getMonth() + 1).padStart(2, "0")}/${agora.getFullYear()}`,
          valorINSS: valorRetido,
          valorOutrasEntidades: 0,
        });

        resultados.push({
          retencaoId: ret.id,
          tipo: "GPS",
          imposto: "INSS",
          valor: valorRetido,
          codigoPagamento: codigoPgto,
          codigoBarras: gps.codigoBarras,
          dadosGps: gps.dadosGps,
          metodo: gps.metodo,
          status: gps.ok ? "EMITIDO" : "ERRO",
          message: gps.message,
        });

        // CNAB
        pagamentosCnab.push({
          tipo: "GPS",
          codigoPagamento: codigoPgto,
          competencia: `${String(agora.getMonth() + 1).padStart(2, "0")}${agora.getFullYear()}`,
          cnpjContribuinte: cnpjCondominio,
          identificadorContribuinte: cnpjCondominio.replace(/\D/g, ""),
          dataVencimento: dataVenc,
          valorINSS: valorRetido,
          valorOutrasEntidades: 0,
        });

        await prisma.retencaoImposto.update({
          where: { id: ret.id },
          data: {
            guiaUrl: gps.codigoBarras ? `GPS:${gps.codigoBarras}` : null,
            observacoes: [
              ret.observacoes,
              `GPS ${codigoPgto} emitida em ${agora.toISOString().split("T")[0]} via ${gps.metodo}`,
            ].filter(Boolean).join(" | "),
          },
        });
      }

      // ===================================================================
      // ISS — NFS-e Nacional (gov.br gratuito)
      // ===================================================================
      else if (tipoImposto === "ISS") {
        const iss = await emitirIssGratuito({
          cnpjTomador: cnpjCondominio,
          documentoPrestador: nota.cnpjFornecedor || nota.cpfFornecedor || "",
          nomePrestador: nota.fornecedor,
          descricaoServico: nota.descricao,
          valorServico: Number(nota.valorBruto),
          aliquotaIss: Number(ret.aliquota),
          valorIss: valorRetido,
          competencia: `${String(agora.getMonth() + 1).padStart(2, "0")}/${agora.getFullYear()}`,
        });

        resultados.push({
          retencaoId: ret.id,
          tipo: "ISS",
          imposto: "ISS",
          valor: valorRetido,
          numeroNfse: iss.numeroNfse,
          urlNfse: iss.urlNfse,
          guiaIss: iss.guiaIss,
          metodo: iss.metodo,
          status: iss.ok ? "EMITIDO" : "ERRO",
          message: iss.message,
        });

        await prisma.retencaoImposto.update({
          where: { id: ret.id },
          data: {
            guiaUrl: iss.urlNfse || null,
            observacoes: [
              ret.observacoes,
              `ISS R$${valorRetido.toFixed(2)} via ${iss.metodo} em ${agora.toISOString().split("T")[0]}`,
              iss.numeroNfse ? `NFS-e: ${iss.numeroNfse}` : null,
            ].filter(Boolean).join(" | "),
          },
        });
      }
    }

    // ===== Gerar CNAB 240 para pagamento em lote (gratuito) =====
    let cnab = null;
    if (pagamentosCnab.length > 0) {
      const empresa: DadosEmpresa = {
        cnpj: cnpjCondominio,
        razaoSocial: process.env.RAZAO_SOCIAL_CONDOMINIO || "CONDOMINIO PARK CLUB",
        banco: process.env.BANCO_CODIGO || "001",
        agencia: process.env.BANCO_AGENCIA || "0001",
        conta: process.env.BANCO_CONTA || "000012345",
        digitoConta: process.env.BANCO_DIGITO || "0",
      };

      const conteudo = gerarCnab240(empresa, pagamentosCnab);
      cnab = {
        conteudo,
        nomeArquivo: `CNAB240_${nota.numero}_${agora.toISOString().split("T")[0].replace(/-/g, "")}.rem`,
        totalPagamentos: pagamentosCnab.length,
        instrucao: "Faça upload deste arquivo .rem no internet banking do seu banco para pagar todas as guias em lote.",
      };
    }

    return NextResponse.json({
      ok: true,
      data: {
        notaId: nota.id,
        fornecedor: nota.fornecedor,
        valorBruto: Number(nota.valorBruto),
        custoTransmissao: "R$ 0,00 (100% gratuito)",
        servicos: {
          darf: "SicalcWeb Receita Federal (gratuito)",
          gps: "SAL Receita Federal (gratuito)",
          iss: isNfseConfigurada()
            ? "API NFS-e Nacional gov.br (gratuito)"
            : "Guia manual — configure NFSE_API_TOKEN para transmissao direta (gratuito)",
        },
        guias: resultados,
        cnab,
        resumo: {
          totalDarfs: resultados.filter(r => r.tipo === "DARF").length,
          totalGps: resultados.filter(r => r.tipo === "GPS").length,
          totalIss: resultados.filter(r => r.tipo === "ISS").length,
          valorTotalGuias: resultados.reduce((s, r) => s + r.valor, 0),
          todosEmitidos: resultados.every(r => r.status === "EMITIDO"),
        },
      },
    });
  } catch (e: any) {
    console.error("Erro ao transmitir guias:", e);
    return NextResponse.json(
      { ok: false, message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/fiscal/transmitir?notaEntradaId=xxx
 * Status das guias de uma nota
 */
export async function GET(req: NextRequest) {
  try {
    const notaId = new URL(req.url).searchParams.get("notaEntradaId") ?? "";
    if (!notaId) {
      return NextResponse.json({ ok: false, message: "notaEntradaId e obrigatorio" }, { status: 400 });
    }

    const nota = await prisma.notaEntrada.findUnique({
      where: { id: notaId },
      include: { retencoes: true },
    });

    if (!nota) {
      return NextResponse.json({ ok: false, message: "Nota nao encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      data: {
        notaId: nota.id,
        status: nota.status,
        custoTransmissao: "R$ 0,00 (100% gratuito)",
        nfseConfigurada: isNfseConfigurada(),
        guias: nota.retencoes.map(r => ({
          id: r.id,
          tipo: r.tipoImposto,
          valor: Number(r.valorRetido),
          aliquota: Number(r.aliquota),
          vencimento: r.dataVencimento,
          status: r.status,
          codigoRecolhimento: r.codigoRecolhimento,
          guiaUrl: r.guiaUrl,
          pago: r.dataPagamento != null,
          observacoes: r.observacoes,
        })),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extrai código DARF numérico do campo codigoRecolhimento */
function extrairCodigoReceita(codRecolhimento: string | null, tipoImposto: string): string {
  if (codRecolhimento) {
    const nums = codRecolhimento.replace(/\D/g, "");
    if (nums.length >= 4) return nums.substring(0, 4);
  }
  const map: Record<string, string> = {
    IRRF: "1708",
    CSLL: "5952",
    COFINS: "5952",
    PIS: "5952",
    OUTRO: "0000",
  };
  return map[tipoImposto] || "0000";
}

/** Extrai código GPS numérico */
function extrairCodigoGps(codRecolhimento: string | null): string {
  if (codRecolhimento) {
    const nums = codRecolhimento.replace(/\D/g, "");
    if (nums.length >= 4) return nums.substring(0, 4);
  }
  return "2631"; // Default: cessão de mão de obra PJ
}
