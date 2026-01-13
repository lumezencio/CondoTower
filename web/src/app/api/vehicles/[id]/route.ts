import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        unit: { select: { id: true, block: true, number: true } },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ ok: false, message: "Veiculo nao encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: vehicle });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();

    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, message: "Veiculo nao encontrado" }, { status: 404 });
    }

    const plate = String(body?.plate ?? "").trim().toUpperCase();
    if (!plate) {
      return NextResponse.json({ ok: false, message: "Placa e obrigatoria" }, { status: 400 });
    }

    // Verificar se placa ja existe em outro veiculo
    if (plate !== existing.plate) {
      const duplicatePlate = await prisma.vehicle.findFirst({
        where: { tenant: "parkclub", plate, id: { not: id } },
      });
      if (duplicatePlate) {
        return NextResponse.json({ ok: false, message: "Placa ja cadastrada em outro veiculo" }, { status: 400 });
      }
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        unitId: body?.unitId ?? existing.unitId,
        plate,
        brand: body?.brand?.trim().toUpperCase() || null,
        model: body?.model?.trim().toUpperCase() || null,
        color: body?.color?.trim().toUpperCase() || null,
        year: body?.year ? Number(body.year) : null,
        tag: body?.tag?.trim().toUpperCase() || null,
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

    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, message: "Veiculo nao encontrado" }, { status: 404 });
    }

    await prisma.vehicle.delete({ where: { id } });

    return NextResponse.json({ ok: true, message: "Veiculo excluido com sucesso" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
