import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const pet = await prisma.pet.findUnique({
      where: { id },
      include: {
        unit: { select: { id: true, block: true, number: true } },
      },
    });

    if (!pet) {
      return NextResponse.json({ ok: false, message: "Pet nao encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: pet });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();

    const existing = await prisma.pet.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, message: "Pet nao encontrado" }, { status: 404 });
    }

    const name = String(body?.name ?? "").trim().toUpperCase();
    const species = String(body?.species ?? "").trim().toUpperCase();

    if (!name) {
      return NextResponse.json({ ok: false, message: "Nome do pet e obrigatorio" }, { status: 400 });
    }
    if (!species) {
      return NextResponse.json({ ok: false, message: "Especie e obrigatoria" }, { status: 400 });
    }

    const updated = await prisma.pet.update({
      where: { id },
      data: {
        unitId: body?.unitId ?? existing.unitId,
        name,
        species,
        breed: body?.breed?.trim().toUpperCase() || null,
        color: body?.color?.trim().toUpperCase() || null,
        size: body?.size?.trim().toUpperCase() || null,
        birthDate: body?.birthDate || null,
        vaccinated: body?.vaccinated ?? existing.vaccinated,
        notes: body?.notes?.trim().toUpperCase() || null,
      },
      include: {
        unit: { select: { id: true, block: true, number: true } },
      },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;

    const existing = await prisma.pet.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, message: "Pet nao encontrado" }, { status: 404 });
    }

    await prisma.pet.delete({ where: { id } });

    return NextResponse.json({ ok: true, message: "Pet excluido com sucesso" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
