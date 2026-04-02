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
      prisma.poll.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          votes: {
            select: {
              vote: true,
              unit: {
                select: {
                  block: true,
                  number: true,
                },
              },
            },
          },
        },
      }),
      prisma.poll.count({ where }),
    ]);

    const polls = data.map((poll: any) => ({
      ...poll,
      totalVotes: poll.votes.length,
    }));

    return NextResponse.json({ ok: true, data: polls, total, page, pageSize });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = String(body?.title ?? "").trim();
    const options = body?.options;
    const startsAt = body?.startsAt;
    const endsAt = body?.endsAt;

    if (!title) return NextResponse.json({ ok: false, message: "Título é obrigatório" }, { status: 400 });
    if (!options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ ok: false, message: "Mínimo de 2 opções necessárias" }, { status: 400 });
    }
    if (!startsAt || !endsAt) {
      return NextResponse.json({ ok: false, message: "Datas de início e fim são obrigatórias" }, { status: 400 });
    }

    const poll = await prisma.poll.create({
      data: {
        tenant: "parkclub",
        title,
        description: body?.description || null,
        options,
        multiple: body?.multiple || false,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        status: "ATIVA",
        anonymous: body?.anonymous || false,
        totalVotes: 0,
      },
    });

    return NextResponse.json({ ok: true, data: poll }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
