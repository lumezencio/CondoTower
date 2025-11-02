import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveUnitId(body: any): Promise<string> {
  const byId = (body?.unitId ?? "").toString().trim();
  if (byId) return byId;

  const block = (body?.block ?? "").toString().trim();
  const apartment = (body?.apartment ?? body?.number ?? "").toString().trim();
  if (!block || !apartment) return "";

  const found = await prisma.unit.findFirst({ where: { block, number: apartment } });
  if (found) return found.id;

  const created = await prisma.unit.create({
    data: { block, number: apartment, notes: null },
  });
  return created.id;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);

    const [data, total] = await Promise.all([
      prisma.resident.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: { unit: true }, // <- traz block/number
      }),
      prisma.resident.count(),
    ]);

    return NextResponse.json({ ok: true, data, total, page, pageSize });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const unitId = await resolveUnitId(body);
    const name   = String(body?.name ?? "").trim();
    if (!unitId || !name) {
      return NextResponse.json({ ok: false, message: "unitId ou (block+apartment) e name são obrigatórios" }, { status: 400 });
    }

    const created = await prisma.resident.create({
      data: {
        unitId,
        name,
        email: body?.email ?? null,
        phone: body?.phone ?? null,
        cpf: body?.document ?? body?.cpf ?? null,          // mapeia document -> cpf
        role: body?.type ?? body?.role ?? "MORADOR",
        isOwner: Boolean(body?.isPrimary ?? body?.isOwner ?? false), // mapeia isPrimary -> isOwner
        birthDate: body?.birthDate ? new Date(body.birthDate) : null,
      },
      include: { unit: true },
    });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
