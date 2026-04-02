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
      prisma.meeting.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { scheduledFor: "desc" },
      }),
      prisma.meeting.count({ where }),
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
    const agenda = String(body?.agenda ?? "").trim();
    const scheduledFor = body?.scheduledFor;

    if (!type) return NextResponse.json({ ok: false, message: "Tipo é obrigatório" }, { status: 400 });
    if (!title) return NextResponse.json({ ok: false, message: "Título é obrigatório" }, { status: 400 });
    if (!scheduledFor) return NextResponse.json({ ok: false, message: "Data é obrigatória" }, { status: 400 });

    const meeting = await prisma.meeting.create({
      data: {
        tenant: "parkclub",
        type: type as any,
        title,
        description,
        agenda,
        scheduledFor: new Date(scheduledFor),
        location: body?.location || null,
        status: "AGENDADA",
        unitId: body?.unitId || null,
      },
    });

    return NextResponse.json({ ok: true, data: meeting }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
