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

    const evento = await prisma.evento.findFirst({
      where: { id, tenant: "parkclub" },
      include: {
        areaComum: {
          select: { id: true, nome: true, tipo: true },
        },
        unit: {
          select: { id: true, block: true, number: true },
        },
      },
    });

    if (!evento) {
      return NextResponse.json({ ok: false, message: "Evento não encontrado" }, { status: 404 });
    }

    const data = { ...evento, valor: evento.valor?.toNumber() ?? null };

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.evento.findFirst({
      where: { id, tenant: "parkclub" },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, message: "Evento não encontrado" }, { status: 404 });
    }

    const updateData: any = {};
    if (body.areaComumId !== undefined) updateData.areaComumId = body.areaComumId;
    if (body.unitId !== undefined) updateData.unitId = body.unitId;
    if (body.titulo !== undefined) updateData.titulo = body.titulo;
    if (body.descricao !== undefined) updateData.descricao = body.descricao;
    if (body.dataInicio !== undefined) updateData.dataInicio = new Date(body.dataInicio);
    if (body.dataFim !== undefined) updateData.dataFim = new Date(body.dataFim);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.valor !== undefined) updateData.valor = body.valor;
    if (body.nomeResponsavel !== undefined) updateData.nomeResponsavel = body.nomeResponsavel;
    if (body.telefoneResponsavel !== undefined) updateData.telefoneResponsavel = body.telefoneResponsavel;
    if (body.motivoRejeicao !== undefined) updateData.motivoRejeicao = body.motivoRejeicao;
    if (body.observacoes !== undefined) updateData.observacoes = body.observacoes;

    // Log status change to APROVADO from PENDENTE
    if (body.status === "APROVADO" && existing.status === "PENDENTE") {
      console.log(`Evento ${id} aprovado (era PENDENTE). Título: ${existing.titulo}`);
    }

    const updated = await prisma.evento.update({
      where: { id },
      data: updateData,
      include: {
        areaComum: {
          select: { id: true, nome: true, tipo: true },
        },
        unit: {
          select: { id: true, block: true, number: true },
        },
      },
    });

    const data = { ...updated, valor: updated.valor?.toNumber() ?? null };

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.evento.findFirst({
      where: { id, tenant: "parkclub" },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, message: "Evento não encontrado" }, { status: 404 });
    }

    await prisma.evento.delete({ where: { id } });

    return NextResponse.json({ ok: true, message: "Evento excluído com sucesso" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
