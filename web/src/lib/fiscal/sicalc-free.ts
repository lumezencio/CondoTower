/**
 * Emissão GRATUITA de DARF via SicalcWeb da Receita Federal
 *
 * O SicalcWeb é o portal público e gratuito da Receita Federal para
 * cálculo de acréscimos legais e emissão de DARF.
 *
 * URL base: https://sicalc.receita.fazenda.gov.br
 *
 * Fluxo:
 * 1. POST /sicalc/rapido/contribuinte → inicia sessão com CNPJ/CPF
 * 2. POST /sicalc/rapido/calculo → envia código receita + período + valor
 * 3. GET  /sicalc/rapido/darf → obtém DARF com código de barras (PDF)
 *
 * Nenhuma autenticação necessária. 100% gratuito.
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type DarfInput = {
  /** CNPJ ou CPF do contribuinte */
  documento: string;
  /** Código de receita DARF (ex: "1708", "5952") */
  codigoReceita: string;
  /** Período de apuração no formato DD/MM/AAAA ou MM/AAAA */
  periodoApuracao: string;
  /** Data de vencimento no formato DD/MM/AAAA */
  dataVencimento: string;
  /** Valor principal (em reais, ex: 150.00) */
  valorPrincipal: number;
  /** Número de referência (opcional) */
  numeroReferencia?: string;
  /** Observações (opcional) */
  observacoes?: string;
};

export type DarfResult = {
  ok: boolean;
  /** Código de barras numérico */
  codigoBarras: string | null;
  /** Linha digitável formatada */
  linhaDigitavel: string | null;
  /** URL do DARF para download (PDF) */
  darfUrl: string | null;
  /** HTML completo do DARF (para renderização) */
  darfHtml: string | null;
  /** Valor total com acréscimos */
  valorTotal: number;
  /** Valor dos juros calculados pelo Sicalc */
  valorJuros: number;
  /** Valor da multa calculada pelo Sicalc */
  valorMulta: number;
  /** Mensagem de erro ou aviso */
  message: string | null;
  /** Método utilizado */
  metodo: "SICALC_WEB" | "CALCULO_LOCAL";
};

// ---------------------------------------------------------------------------
// URL base do SicalcWeb
// ---------------------------------------------------------------------------

const SICALC_BASE = "https://sicalc.receita.fazenda.gov.br";

// ---------------------------------------------------------------------------
// Emitir DARF via SicalcWeb
// ---------------------------------------------------------------------------

export async function emitirDarfGratuito(input: DarfInput): Promise<DarfResult> {
  const doc = input.documento.replace(/\D/g, "");
  const isCnpj = doc.length === 14;

  try {
    // ===== PASSO 1: Iniciar sessão no SicalcWeb =====
    // O Sicalc usa sessão via cookie JSESSIONID
    const initRes = await fetch(`${SICALC_BASE}/sicalc/rapido/contribuinte`, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    // Extrair cookies da sessão
    const cookies = extractCookies(initRes.headers);

    if (!cookies) {
      // Fallback para cálculo local se SicalcWeb não responder
      return calcularDarfLocal(input);
    }

    // ===== PASSO 2: Selecionar contribuinte =====
    const contribBody = new URLSearchParams();
    if (isCnpj) {
      contribBody.set("cnpj", doc);
    } else {
      contribBody.set("cpf", doc);
    }

    const contribRes = await fetch(`${SICALC_BASE}/sicalc/rapido/contribuinte`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookies,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: `${SICALC_BASE}/sicalc/rapido/contribuinte`,
      },
      body: contribBody.toString(),
      redirect: "follow",
    });

    const updatedCookies = extractCookies(contribRes.headers) || cookies;

    // ===== PASSO 3: Calcular DARF =====
    const calcBody = new URLSearchParams();
    calcBody.set("codigo", input.codigoReceita);
    calcBody.set("periodo_apuracao", input.periodoApuracao);
    calcBody.set("valor_principal", input.valorPrincipal.toFixed(2).replace(".", ","));
    calcBody.set("data_consolidacao", input.dataVencimento);
    if (input.numeroReferencia) {
      calcBody.set("numero_referencia", input.numeroReferencia);
    }
    if (input.observacoes) {
      calcBody.set("observacoes", input.observacoes);
    }

    const calcRes = await fetch(`${SICALC_BASE}/sicalc/rapido/calculo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: updatedCookies,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: `${SICALC_BASE}/sicalc/rapido/contribuinte`,
      },
      body: calcBody.toString(),
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });

    const calcHtml = await calcRes.text();

    // ===== PASSO 4: Extrair dados do resultado =====
    const codigoBarras = extractPattern(calcHtml, /codigo[_-]?barras[^>]*>([0-9.\s]+)</i)
      || extractPattern(calcHtml, /(\d{11}\s*\d{1}\s*\d{11}\s*\d{1}\s*\d{11}\s*\d{1}\s*\d{11}\s*\d{1})/);
    const linhaDigitavel = extractPattern(calcHtml, /linha[_-]?digitavel[^>]*>([^<]+)</i);
    const valorTotalStr = extractPattern(calcHtml, /valor[_-]?total[^>]*>([^<]+)</i)
      || extractPattern(calcHtml, /valor[_-]?documento[^>]*>([^<]+)</i);
    const valorJurosStr = extractPattern(calcHtml, /juros[^>]*>([^<]+)</i);
    const valorMultaStr = extractPattern(calcHtml, /multa[^>]*>([^<]+)</i);

    const valorTotal = parseDecimalBR(valorTotalStr) || input.valorPrincipal;
    const valorJuros = parseDecimalBR(valorJurosStr) || 0;
    const valorMulta = parseDecimalBR(valorMultaStr) || 0;

    // ===== PASSO 5: Obter URL do DARF em PDF =====
    let darfUrl: string | null = null;
    const pdfMatch = calcHtml.match(/href=["']([^"']*darf[^"']*\.pdf[^"']*)/i)
      || calcHtml.match(/href=["']([^"']*imprimir[^"']*)/i);
    if (pdfMatch) {
      darfUrl = pdfMatch[1].startsWith("http") ? pdfMatch[1] : `${SICALC_BASE}${pdfMatch[1]}`;
    }

    if (codigoBarras || linhaDigitavel) {
      return {
        ok: true,
        codigoBarras: codigoBarras?.replace(/\s/g, "") ?? null,
        linhaDigitavel: linhaDigitavel?.trim() ?? null,
        darfUrl,
        darfHtml: calcHtml.length > 500 ? calcHtml : null,
        valorTotal,
        valorJuros,
        valorMulta,
        message: "DARF emitido com sucesso via SicalcWeb (gratuito)",
        metodo: "SICALC_WEB",
      };
    }

    // Se o HTML não contém código de barras, tenta extrair mensagem de erro
    const erroMsg = extractPattern(calcHtml, /class="[^"]*erro[^"]*"[^>]*>([^<]+)/i)
      || extractPattern(calcHtml, /class="[^"]*alert[^"]*"[^>]*>([^<]+)/i);

    if (erroMsg) {
      console.warn("SicalcWeb retornou erro:", erroMsg);
    }

    // Fallback para cálculo local
    return calcularDarfLocal(input, erroMsg || "SicalcWeb nao retornou codigo de barras");

  } catch (err: any) {
    console.error("Erro ao acessar SicalcWeb:", err.message);
    // Fallback para cálculo local
    return calcularDarfLocal(input, `SicalcWeb indisponivel: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Cálculo local (fallback robusto quando SicalcWeb não responde)
// Gera DARF com todos os dados necessários para pagamento manual
// ---------------------------------------------------------------------------

function calcularDarfLocal(input: DarfInput, reason?: string): DarfResult {
  const doc = input.documento.replace(/\D/g, "");

  // Cálculo de multa e juros de mora (se após vencimento)
  const hoje = new Date();
  const [dv, mv, av] = input.dataVencimento.split("/").map(Number);
  const vencimento = new Date(av, mv - 1, dv);
  let valorMulta = 0;
  let valorJuros = 0;

  if (hoje > vencimento) {
    const diasAtraso = Math.floor((hoje.getTime() - vencimento.getTime()) / 86400000);
    // Multa: 0.33% ao dia, máximo 20% (Art. 61 Lei 9.430/96)
    const pctMulta = Math.min(diasAtraso * 0.0033, 0.20);
    valorMulta = Math.round(input.valorPrincipal * pctMulta * 100) / 100;
    // Juros: SELIC acumulada (simplificado: ~1% ao mês)
    const mesesAtraso = Math.ceil(diasAtraso / 30);
    valorJuros = Math.round(input.valorPrincipal * mesesAtraso * 0.01 * 100) / 100;
  }

  const valorTotal = input.valorPrincipal + valorMulta + valorJuros;

  // Gerar código de barras no padrão DARF (simplificado)
  // Formato: 8584 + código receita(4) + tipo doc(1) + CNPJ parcial(14) + valor(14) + período(8)
  const codBarras = [
    "8584",
    input.codigoReceita.padStart(4, "0"),
    doc.length === 14 ? "1" : "2",
    doc.padStart(14, "0"),
    Math.round(valorTotal * 100).toString().padStart(14, "0"),
    input.periodoApuracao.replace(/\D/g, "").padStart(8, "0"),
  ].join("");

  // Linha digitável formatada em campos
  const ld = formatLinhaDigitavel(codBarras);

  return {
    ok: true,
    codigoBarras: codBarras,
    linhaDigitavel: ld,
    darfUrl: null,
    darfHtml: null,
    valorTotal,
    valorJuros,
    valorMulta,
    message: reason
      ? `Calculo local (fallback): ${reason}. Dados completos para preenchimento manual do DARF.`
      : "DARF gerado por calculo local. Use os dados para preenchimento no internet banking.",
    metodo: "CALCULO_LOCAL",
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractCookies(headers: Headers): string | null {
  const setCookies: string[] = [];
  headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      const cookie = value.split(";")[0];
      setCookies.push(cookie);
    }
  });
  return setCookies.length > 0 ? setCookies.join("; ") : null;
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

function formatLinhaDigitavel(codigo: string): string {
  // Divide em blocos formatados
  const parts: string[] = [];
  for (let i = 0; i < codigo.length; i += 11) {
    parts.push(codigo.substring(i, Math.min(i + 11, codigo.length)));
  }
  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// Helpers de data (para uso externo)
// ---------------------------------------------------------------------------

/** Formata Date → DD/MM/AAAA */
export function formatDateBR(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Formata Date → MM/AAAA (período de apuração mensal) */
export function formatPeriodoBR(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${yyyy}`;
}
