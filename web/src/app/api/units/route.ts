import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);

    const block = (searchParams.get("block") ?? "").trim();
    const number = (searchParams.get("number") ?? searchParams.get("apartment") ?? "").trim();

    const where: any = {};
    if (block) where.block = block;
    if (number) where.number = number;

    const [data, total] = await Promise.all([
      prisma.unit.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ block: "asc" }, { number: "asc" }],
        include: {
          owners: true,
          _count: {
            select: {
              residents: true,
              vehicles: true,
              owners: true,
            },
          },
        },
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
    const block = String(body?.block ?? "").trim();
    const number = String(body?.number ?? body?.apartment ?? "").trim();
    if (!block || !number) {
      return NextResponse.json(
        { ok: false, message: "block e number (apartment) são obrigatórios" },
        { status: 400 }
      );
    }

    const created = await prisma.unit.create({
      data: {
        block,
        number,
        notes: body?.notes ?? null,
        areaM2: body?.areaM2 ?? null,
        bedrooms: body?.bedrooms ?? 0,
        parkingSpots: body?.parkingSpots ?? 0,
      },
    });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
