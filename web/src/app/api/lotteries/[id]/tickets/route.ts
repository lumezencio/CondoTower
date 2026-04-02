import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const lottery = await prisma.lottery.findUnique({
      where: { id },
      include: {
        tickets: {
          orderBy: { number: "asc" },
          include: {
            unit: {
              select: {
                block: true,
                number: true,
              },
            },
          },
        },
      },
    });

    if (!lottery) {
      return NextResponse.json({ ok: false, message: "Sorteio não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: lottery });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const lottery = await prisma.lottery.findUnique({
      where: { id },
    });

    if (!lottery) {
      return NextResponse.json({ ok: false, message: "Sorteio não encontrado" }, { status: 404 });
    }

    const holderName = String(body?.holderName ?? "").trim();
    const unitId = body?.unitId;

    if (!holderName) {
      return NextResponse.json({ ok: false, message: "Nome é obrigatório" }, { status: 400 });
    }

    // Gera próximo número disponível
    const existingTickets = await prisma.lotteryTicket.findMany({
      where: { lotteryId: id },
      select: { number: true },
      orderBy: { number: "asc" },
    });

    let number = 1;
    const usedNumbers = existingTickets.map(t => t.number);
    while (usedNumbers.includes(number)) {
      number++;
    }

    const ticket = await prisma.lotteryTicket.create({
      data: {
        tenant: "parkclub",
        lotteryId: id,
        number,
        holderName,
        holderEmail: body?.holderEmail?.trim() || null,
        holderPhone: body?.holderPhone?.trim() || null,
        unitId: unitId || null,
      },
      include: {
        unit: {
          select: {
            block: true,
            number: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, data: ticket }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
