import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cnpj/[cnpj]
 * Proxy para a API pública ReceitaWS com cache de 1 hora.
 *
 * NOTE: ReceitaWS impõe um limite de 1 requisição/minuto para planos gratuitos.
 * Respostas bem-sucedidas são cacheadas por 3600 s (Cache-Control + Next.js revalidate).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  const { cnpj: rawCnpj } = await params;

  // Clean: remove dots, dashes and slashes
  const cnpj = rawCnpj.replace(/[.\-/]/g, "").trim();

  // Validate: must be exactly 14 digits
  if (!/^\d{14}$/.test(cnpj)) {
    return NextResponse.json(
      { ok: false, message: "CNPJ inválido. Informe os 14 dígitos numéricos." },
      { status: 400 }
    );
  }

  let externalRes: Response;
  let externalData: any;

  try {
    externalRes = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`, {
      headers: {
        "User-Agent": "CondoTower/1.0",
        Accept: "application/json",
      },
      // Next.js built-in fetch cache: revalidate every hour
      next: { revalidate: 3600 },
    });

    externalData = await externalRes.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Serviço de consulta CNPJ indisponível" },
      { status: 503 }
    );
  }

  // ReceitaWS returns status: "ERROR" when CNPJ is not found
  if (!externalRes.ok || externalData?.status === "ERROR") {
    return NextResponse.json(
      { ok: false, message: "CNPJ não encontrado" },
      { status: 404 }
    );
  }

  const data = {
    cnpj: externalData.cnpj ?? cnpj,
    nome: externalData.nome ?? null,
    fantasia: externalData.fantasia ?? null,
    situacao: externalData.situacao ?? null,
    tipo: externalData.tipo ?? null,
    logradouro: externalData.logradouro ?? null,
    numero: externalData.numero ?? null,
    complemento: externalData.complemento ?? null,
    bairro: externalData.bairro ?? null,
    municipio: externalData.municipio ?? null,
    uf: externalData.uf ?? null,
    cep: externalData.cep ?? null,
    email: externalData.email ?? null,
    telefone: externalData.telefone ?? null,
    abertura: externalData.abertura ?? null,
    capital_social: externalData.capital_social ?? null,
    // Optante pelo Simples Nacional ou MEI (SIMEI)
    simples:
      externalData.simei?.optante === true ||
      externalData.simples?.optante === true ||
      false,
  };

  return NextResponse.json(
    { ok: true, data },
    {
      headers: {
        // Cache at the CDN / browser level for 1 hour
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=600",
        // Informational: rate limit note for API consumers
        "X-RateLimit-Note":
          "ReceitaWS free tier: 1 request/minute. Responses cached for 3600s.",
      },
    }
  );
}
