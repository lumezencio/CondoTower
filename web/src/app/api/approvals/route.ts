import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 20);
    const status = searchParams.get("status") ?? "";
    const type = searchParams.get("type") ?? "";
    const period = searchParams.get("period") ?? "";

    const where: any = { tenant: "parkclub" };
    if (status) where.status = status;
    if (type) where.type = type;
    if (period) where.period = period;

    const [data, total] = await Promise.all([
      prisma.approval.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.approval.count({ where }),
    ]);

    return NextResponse.json({ ok: true, data, total, page, pageSize });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const type = String(body?.type ?? "").trim();
    const title = String(body?.title ?? "").trim();
    const description = String(body?.description ?? "").trim();

    if (!type) return NextResponse.json({ ok: false, message: "Tipo é obrigatório" }, { status: 400 });
    if (!title) return NextResponse.json({ ok: false, message: "Título é obrigatório" }, { status: 400 });
    if (!description) return NextResponse.json({ ok: false, message: "Descrição é obrigatória" }, { status: 400 });

    const approval = await prisma.approval.create({
      data: {
        tenant: "parkclub",
        type: type as any,
        title,
        description,
        period: body?.period || new Date().toISOString().slice(0, 7),
        documentUrl: body?.documentUrl || null,
        status: "PENDENTE",
        unitId: body?.unitId || null,
      },
    });

    return NextResponse.json({ ok: true, data: approval }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
