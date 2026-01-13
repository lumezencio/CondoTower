import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);
    const unitId = (searchParams.get("unitId") ?? "").trim();
    const name = (searchParams.get("name") ?? "").trim();

    const where: any = { tenant: "parkclub" };
    if (unitId) where.unitId = unitId;
    if (name) where.name = { contains: name, mode: "insensitive" };

    const [data, total] = await Promise.all([
      prisma.pet.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          unit: {
            select: { id: true, block: true, number: true },
          },
        },
      }),
      prisma.pet.count({ where }),
    ]);

    return NextResponse.json({ ok: true, data, total, page, pageSize });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const unitId = String(body?.unitId ?? "").trim();
    const name = String(body?.name ?? "").trim().toUpperCase();
    const species = String(body?.species ?? "").trim().toUpperCase();

    if (!unitId) {
      return NextResponse.json({ ok: false, message: "unitId e obrigatorio" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ ok: false, message: "Nome do pet e obrigatorio" }, { status: 400 });
    }
    if (!species) {
      return NextResponse.json({ ok: false, message: "Especie e obrigatoria" }, { status: 400 });
    }

    const created = await prisma.pet.create({
      data: {
        tenant: "parkclub",
        unitId,
        name,
        species,
        breed: body?.breed?.trim().toUpperCase() || null,
        color: body?.color?.trim().toUpperCase() || null,
        size: body?.size?.trim().toUpperCase() || null,
        birthDate: body?.birthDate || null,
        vaccinated: body?.vaccinated ?? false,
        notes: body?.notes?.trim().toUpperCase() || null,
      },
      include: {
        unit: { select: { id: true, block: true, number: true } },
      },
    });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
