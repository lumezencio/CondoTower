/**
 * Integração GRATUITA com API NFS-e Nacional (gov.br)
 *
 * A partir de 01/01/2026, a NFS-e Nacional é obrigatória em todo o Brasil
 * (Lei Complementar 214/2025).
 *
 * API oficial: https://www.nfse.gov.br/swagger/contribuintes/
 * Documentação: https://www.gov.br/nfse/pt-br/municipios/produtos-disponiveis/api-de-integracao
 *
 * Requisitos para transmissão direta (gratuita):
 *   - Certificado digital A1/A3 do condomínio
 *   - Credenciamento no portal gov.br/nfse
 *   - Inscrição municipal ativa
 *
 * Enquanto as credenciais não estiverem configuradas,
 * o sistema gera os dados da guia ISS para pagamento manual
 * no portal da prefeitura.
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type NfseIssInput = {
  /** CNPJ do condomínio (tomador do serviço) */
  cnpjTomador: string;
  /** CNPJ/CPF do prestador (fornecedor) */
  documentoPrestador: string;
  /** Nome do prestador */
  nomePrestador: string;
  /** Código do serviço (LC 116/2003) */
  codigoServico?: string;
  /** Descrição do serviço */
  descricaoServico: string;
  /** Valor bruto do serviço */
  valorServico: number;
  /** Alíquota ISS (ex: 0.05 para 5%) */
  aliquotaIss: number;
  /** Valor do ISS retido */
  valorIss: number;
  /** Código município IBGE do tomador */
  codigoMunicipioTomador?: string;
  /** Data da competência */
  competencia: string;
};

export type NfseIssResult = {
  ok: boolean;
  /** Número da NFS-e (quando emitida) */
  numeroNfse: string | null;
  /** Código de verificação */
  codigoVerificacao: string | null;
  /** URL da NFS-e no portal */
  urlNfse: string | null;
  /** Dados da guia ISS para pagamento */
  guiaIss: {
    codigoMunicipio: string;
    competencia: string;
    valorIss: number;
    aliquota: number;
    cnpjPrestador: string;
    nomePrestador: string;
  };
  /** Método utilizado */
  metodo: "NFSE_NACIONAL" | "GUIA_MANUAL";
  message: string | null;
};

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

const NFSE_API_URL = process.env.NFSE_API_URL
  || "https://www.nfse.gov.br/EmissorNacional/api";

const NFSE_API_TOKEN = process.env.NFSE_API_TOKEN || "";

// Código município IBGE padrão (São Paulo = "3550308")
const MUNICIPIO_IBGE = process.env.MUNICIPIO_IBGE || "3550308";

// ---------------------------------------------------------------------------
// Emitir guia ISS via NFS-e Nacional
// ---------------------------------------------------------------------------

export async function emitirIssGratuito(input: NfseIssInput): Promise<NfseIssResult> {
  const guiaIss = {
    codigoMunicipio: input.codigoMunicipioTomador || MUNICIPIO_IBGE,
    competencia: input.competencia,
    valorIss: input.valorIss,
    aliquota: input.aliquotaIss,
    cnpjPrestador: input.documentoPrestador.replace(/\D/g, ""),
    nomePrestador: input.nomePrestador,
  };

  // Se não tiver credenciais NFS-e, gera guia manual
  if (!NFSE_API_TOKEN) {
    return {
      ok: true,
      numeroNfse: null,
      codigoVerificacao: null,
      urlNfse: null,
      guiaIss,
      metodo: "GUIA_MANUAL",
      message: [
        `ISS R$${input.valorIss.toFixed(2)} sobre servico de ${input.nomePrestador}.`,
        `Pague via portal da prefeitura (cod. municipio IBGE: ${guiaIss.codigoMunicipio}).`,
        "Para transmissao direta gratuita, configure NFSE_API_TOKEN no .env",
        "(credenciamento em gov.br/nfse, 100% gratuito).",
      ].join(" "),
    };
  }

  try {
    // ===== Transmissão via API NFS-e Nacional =====
    // Monta XML da DPS (Declaração de Prestação de Serviço)
    const dps = montarDps(input);

    const res = await fetch(`${NFSE_API_URL}/v1/contribuintes/dps`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NFSE_API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(dps),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("NFS-e Nacional erro:", res.status, errText);
      return {
        ok: true,
        numeroNfse: null,
        codigoVerificacao: null,
        urlNfse: null,
        guiaIss,
        metodo: "GUIA_MANUAL",
        message: `Erro na API NFS-e Nacional (${res.status}). Pague o ISS via portal da prefeitura.`,
      };
    }

    const data = await res.json();

    return {
      ok: true,
      numeroNfse: data.numero ?? data.nfse?.numero ?? null,
      codigoVerificacao: data.codigoVerificacao ?? data.nfse?.codigoVerificacao ?? null,
      urlNfse: data.url ?? data.linkConsulta ?? null,
      guiaIss,
      metodo: "NFSE_NACIONAL",
      message: data.numero
        ? `NFS-e ${data.numero} emitida com sucesso via portal nacional (gratuito)`
        : "DPS enviada ao portal nacional. Aguardando processamento.",
    };
  } catch (err: any) {
    console.error("Erro NFS-e Nacional:", err.message);
    return {
      ok: true,
      numeroNfse: null,
      codigoVerificacao: null,
      urlNfse: null,
      guiaIss,
      metodo: "GUIA_MANUAL",
      message: `API NFS-e indisponivel: ${err.message}. Pague o ISS via portal da prefeitura.`,
    };
  }
}

// ---------------------------------------------------------------------------
// Montar DPS (Declaração de Prestação de Serviço) no padrão nacional
// ---------------------------------------------------------------------------

function montarDps(input: NfseIssInput) {
  const agora = new Date().toISOString();
  const docPrestador = input.documentoPrestador.replace(/\D/g, "");
  const docTomador = input.cnpjTomador.replace(/\D/g, "");

  return {
    // Cabeçalho
    versao: "1.00",
    infDPS: {
      tpAmb: process.env.NFSE_AMBIENTE === "producao" ? 1 : 2, // 1=prod, 2=homologacao
      dhEmi: agora,
      verAplic: "CondoTower-1.0",
      serie: "WEB",

      // Prestador
      prest: {
        CNPJ: docPrestador.length === 14 ? docPrestador : undefined,
        CPF: docPrestador.length === 11 ? docPrestador : undefined,
        xNome: input.nomePrestador,
        IM: "", // Inscrição municipal — configurar via env
      },

      // Tomador (condomínio)
      toma: {
        CNPJ: docTomador,
      },

      // Serviço
      serv: {
        cServ: {
          cTribNac: input.codigoServico || "01.07", // LC 116 default
        },
        xDescServ: input.descricaoServico,
        cMunPrestworker: input.codigoMunicipioTomador || MUNICIPIO_IBGE,
      },

      // Valores
      valores: {
        vServPrest: {
          vServ: input.valorServico.toFixed(2),
        },
        trib: {
          totTrib: {
            vTotTribFed: "0.00",
            vTotTribEst: "0.00",
            vTotTribMun: input.valorIss.toFixed(2),
          },
          ISS: {
            aliq: input.aliquotaIss,
            vISS: input.valorIss.toFixed(2),
            tpRetISSQN: 1, // 1 = ISS retido pelo tomador
          },
        },
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Verificar se NFS-e Nacional está configurada
// ---------------------------------------------------------------------------

export function isNfseConfigurada(): boolean {
  return !!NFSE_API_TOKEN;
}
