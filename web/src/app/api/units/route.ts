import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);

    const where = {}; // ajuste futuro (filtros)
    const [data, total] = await Promise.all([
      prisma.unit.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.unit.count({ where }),
    ]);

    return NextResponse.json({ ok: true, data, total, page, pageSize });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const number = String(body?.number ?? "").trim();
    const block  = String(body?.block  ?? "").trim();
    const notes  = body?.notes ?? null;

    if (!number || !block) {
      return NextResponse.json({ ok: false, message: "number e block são obrigatórios" }, { status: 400 });
    }

    // IMPORTANTE: não enviar 'floor' para o Prisma
    const created = await prisma.unit.create({
      data: { number, block, notes }
    });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
