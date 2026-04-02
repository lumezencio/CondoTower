import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const poll = await prisma.poll.findUnique({
      where: { id },
    });

    if (!poll) {
      return NextResponse.json({ ok: false, message: "Enquete não encontrada" }, { status: 404 });
    }

    const now = new Date();
    if (now < new Date(poll.startsAt)) {
      return NextResponse.json({ ok: false, message: "Enquete ainda não iniciou" }, { status: 400 });
    }
    if (now > new Date(poll.endsAt)) {
      return NextResponse.json({ ok: false, message: "Enquete encerrada" }, { status: 400 });
    }

    const unitId = body?.unitId;
    if (!unitId) {
      return NextResponse.json({ ok: false, message: "unitId é obrigatório" }, { status: 400 });
    }

    // Verifica se já votou
    const existingVote = await prisma.pollVote.findUnique({
      where: {
        pollId_unitId: {
          pollId: id,
          unitId: unitId,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json({ ok: false, message: "Você já votou nesta enquete" }, { status: 409 });
    }

    const vote = body?.vote;
    if (!vote) {
      return NextResponse.json({ ok: false, message: "Voto é obrigatório" }, { status: 400 });
    }

    const pollVote = await prisma.pollVote.create({
      data: {
        tenant: "parkclub",
        pollId: id,
        unitId,
        vote,
        comment: body?.comment || null,
      },
    });

    // Atualiza total de votos
    const totalVotes = await prisma.pollVote.count({
      where: { pollId: id },
    });

    await prisma.poll.update({
      where: { id },
      data: { totalVotes },
    });

    return NextResponse.json({ ok: true, data: pollVote }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
