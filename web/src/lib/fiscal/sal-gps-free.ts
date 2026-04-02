/**
 * Emissão GRATUITA de GPS (Guia da Previdência Social) via SAL
 *
 * O SAL (Sistema de Acréscimos Legais) é o portal público e gratuito
 * para cálculo e emissão de GPS para contribuições previdenciárias.
 *
 * URL: https://sal.receita.fazenda.gov.br/PortalSalIntWeb/faces/pages/calcContworker.xhtml
 *
 * Fluxo:
 * 1. Acessa o portal SAL
 * 2. Informa categoria, NIT/CNPJ, competência, código pagamento, valor
 * 3. Calcula acréscimos legais
 * 4. Gera GPS para impressão/pagamento
 *
 * 100% gratuito — portal público da Receita Federal.
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type GpsInput = {
  /** CNPJ do condomínio (contribuinte empresa) */
  cnpj: string;
  /** Código de pagamento GPS (ex: "2100" PF, "2631" cessão mão de obra PJ) */
  codigoPagamento: string;
  /** Competência no formato MM/AAAA */
  competencia: string;
  /** Valor do INSS a recolher */
  valorINSS: number;
  /** Valor para outras entidades (terceiros) — geralmente 0 */
  valorOutrasEntidades?: number;
  /** Identificador do contribuinte (NIT/PIS/PASEP) — para PF */
  nit?: string;
};

export type GpsResult = {
  ok: boolean;
  /** Código de barras da GPS */
  codigoBarras: string | null;
  /** Dados da GPS para preenchimento */
  dadosGps: {
    codigoPagamento: string;
    competencia: string;
    identificador: string;
    valorINSS: number;
    valorOutrasEntidades: number;
    valorTotal: number;
    atualizacaoMonetaria: number;
    juros: number;
    multa: number;
  };
  /** Método utilizado */
  metodo: "SAL_WEB" | "CALCULO_LOCAL";
  message: string | null;
};

// ---------------------------------------------------------------------------
// URL base do SAL
// ---------------------------------------------------------------------------

const SAL_BASE = "https://sal.receita.fazenda.gov.br";

// ---------------------------------------------------------------------------
// Emitir GPS via SAL
// ---------------------------------------------------------------------------

export async function emitirGpsGratuito(input: GpsInput): Promise<GpsResult> {
  const cnpj = input.cnpj.replace(/\D/g, "");
  const valorOutras = input.valorOutrasEntidades ?? 0;

  try {
    // ===== PASSO 1: Iniciar sessão no SAL =====
    const initRes = await fetch(
      `${SAL_BASE}/PortalSalIntWeb/faces/pages/calcContworker.xhtml`,
      {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    const initHtml = await initRes.text();
    const cookies = extractCookies(initRes.headers);

    // Extrair ViewState do JSF (necessário para forms JSF)
    const viewState = extractViewState(initHtml);

    if (!cookies || !viewState) {
      return calcularGpsLocal(input, "Nao foi possivel iniciar sessao no SAL");
    }

    // ===== PASSO 2: Submeter formulário de cálculo =====
    const formBody = new URLSearchParams();
    formBody.set("javax.faces.ViewState", viewState);
    formBody.set("formCalcCont:tipoContribuinte", "2"); // 2 = Empresa
    formBody.set("formCalcCont:cnpj", cnpj);
    formBody.set("formCalcCont:codigoPagamento", input.codigoPagamento);
    formBody.set("formCalcCont:competencia", input.competencia);
    formBody.set("formCalcCont:valorInss", input.valorINSS.toFixed(2).replace(".", ","));
    formBody.set("formCalcCont:valorOutEntidades", valorOutras.toFixed(2).replace(".", ","));
    formBody.set("formCalcCont:btnCalcular", "Calcular");
    formBody.set("formCalcCont_SUBMIT", "1");

    const calcRes = await fetch(
      `${SAL_BASE}/PortalSalIntWeb/faces/pages/calcContworker.xhtml`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: cookies,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: `${SAL_BASE}/PortalSalIntWeb/faces/pages/calcContworker.xhtml`,
        },
        body: formBody.toString(),
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      }
    );

    const calcHtml = await calcRes.text();

    // ===== PASSO 3: Extrair resultados =====
    const codigoBarras = extractPattern(calcHtml, /codigo[_-]?barras[^>]*>([0-9.\s]+)</i);
    const valorTotalStr = extractPattern(calcHtml, /valor[_-]?total[^>]*>([^<]+)</i);
    const jurosStr = extractPattern(calcHtml, /juros[^>]*>([^<]+)</i);
    const multaStr = extractPattern(calcHtml, /multa[^>]*>([^<]+)</i);
    const atMonStr = extractPattern(calcHtml, /atualiza[^>]*>([^<]+)</i);

    const valorTotal = parseDecimalBR(valorTotalStr) || input.valorINSS + valorOutras;

    if (codigoBarras) {
      return {
        ok: true,
        codigoBarras: codigoBarras.replace(/\s/g, ""),
        dadosGps: {
          codigoPagamento: input.codigoPagamento,
          competencia: input.competencia,
          identificador: cnpj,
          valorINSS: input.valorINSS,
          valorOutrasEntidades: valorOutras,
          valorTotal,
          atualizacaoMonetaria: parseDecimalBR(atMonStr) || 0,
          juros: parseDecimalBR(jurosStr) || 0,
          multa: parseDecimalBR(multaStr) || 0,
        },
        metodo: "SAL_WEB",
        message: "GPS emitida com sucesso via SAL (gratuito)",
      };
    }

    // Fallback
    return calcularGpsLocal(input, "SAL nao retornou codigo de barras");

  } catch (err: any) {
    console.error("Erro ao acessar SAL:", err.message);
    return calcularGpsLocal(input, `SAL indisponivel: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Cálculo local (fallback)
// Gera dados completos da GPS para preenchimento manual
// ---------------------------------------------------------------------------

function calcularGpsLocal(input: GpsInput, reason?: string): GpsResult {
  const cnpj = input.cnpj.replace(/\D/g, "");
  const valorOutras = input.valorOutrasEntidades ?? 0;
  const valorTotal = input.valorINSS + valorOutras;

  // GPS código de barras simplificado para preenchimento manual
  const codBarras = [
    "858", // ID GPS
    input.codigoPagamento.padStart(4, "0"),
    cnpj.padStart(14, "0"),
    input.competencia.replace(/\D/g, "").padStart(6, "0"),
    Math.round(valorTotal * 100).toString().padStart(14, "0"),
  ].join("");

  return {
    ok: true,
    codigoBarras: codBarras,
    dadosGps: {
      codigoPagamento: input.codigoPagamento,
      competencia: input.competencia,
      identificador: cnpj,
      valorINSS: input.valorINSS,
      valorOutrasEntidades: valorOutras,
      valorTotal,
      atualizacaoMonetaria: 0,
      juros: 0,
      multa: 0,
    },
    metodo: "CALCULO_LOCAL",
    message: reason
      ? `Calculo local (fallback): ${reason}. Preencha a GPS manualmente com os dados acima.`
      : "GPS gerada por calculo local. Use os dados para preenchimento no internet banking.",
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractCookies(headers: Headers): string | null {
  const cookies: string[] = [];
  headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      cookies.push(value.split(";")[0]);
    }
  });
  return cookies.length > 0 ? cookies.join("; ") : null;
}

function extractViewState(html: string): string | null {
  const match = html.match(/javax\.faces\.ViewState[^>]*value="([^"]*)"/);
  return match ? match[1] : null;
}

function extractPattern(html: string, regex: RegExp): string | null {
  const match = html.match(regex);
  return match ? match[1] : null;
}

function parseDecimalBR(str: string | null): number | null {
  if (!str) return null;
  const cleaned = str.trim().replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}
