import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const showInactive = searchParams.get("showInactive") === "true";

    const where: any = { tenant: "parkclub" };
    if (!showInactive) where.ativo = true;

    const items = await prisma.areaComum.findMany({
      where,
      orderBy: { nome: "asc" },
    });

    const data = items.map((a) => ({
      ...a,
      valorReserva: a.valorReserva?.toNumber() ?? null,
    }));

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const nome = String(body?.nome ?? "").trim();

    if (!nome) {
      return NextResponse.json({ ok: false, message: "Nome é obrigatório" }, { status: 400 });
    }

    const areaComum = await prisma.areaComum.create({
      data: {
        tenant: "parkclub",
        nome,
        ativo: true,
        tipo: body?.tipo ?? "OUTRO",
        descricao: body?.descricao?.trim() || null,
        capacidade: body?.capacidade ?? null,
        valorReserva: body?.valorReserva ?? null,
        antecedenciaMin: body?.antecedenciaMin ?? 24,
        requerAprovacao: body?.requerAprovacao ?? false,
        regras: body?.regras?.trim() || null,
      },
    });

    const data = {
      ...areaComum,
      valorReserva: areaComum.valorReserva?.toNumber() ?? null,
    };

    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
