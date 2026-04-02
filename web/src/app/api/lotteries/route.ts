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

    const where: any = { tenant: "parkclub" };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.lottery.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { scheduledFor: "desc" },
        include: {
          tickets: {
            orderBy: { number: "asc" },
          },
        },
      }),
      prisma.lottery.count({ where }),
    ]);

    return NextResponse.json({ ok: true, data, total, page, pageSize });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = String(body?.title ?? "").trim();
    const type = String(body?.type ?? "").trim();
    const scheduledFor = body?.scheduledFor;

    if (!title) return NextResponse.json({ ok: false, message: "Título é obrigatório" }, { status: 400 });
    if (!type) return NextResponse.json({ ok: false, message: "Tipo é obrigatório" }, { status: 400 });
    if (!scheduledFor) return NextResponse.json({ ok: false, message: "Data é obrigatória" }, { status: 400 });

    const lottery = await prisma.lottery.create({
      data: {
        tenant: "parkclub",
        title,
        type: type as any,
        description: body?.description || null,
        rules: body?.rules || null,
        scheduledFor: new Date(scheduledFor),
        status: "AGENDADO",
      },
    });

    return NextResponse.json({ ok: true, data: lottery }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
