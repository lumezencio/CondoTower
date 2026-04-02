import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unitInclude = {
  unit: {
    select: {
      id: true,
      block: true,
      number: true,
    },
  },
};

/**
 * GET /api/tickets/[id]
 * Retorna um chamado pelo ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const chamado = await prisma.chamado.findUnique({
      where: { id },
      include: unitInclude,
    });

    if (!chamado) {
      return NextResponse.json({ ok: false, message: "Chamado não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      data: {
        ...chamado,
        custo: (chamado as any).custo?.toNumber() ?? null,
      },
    });
  } catch (e: any) {
    console.error("Erro ao buscar chamado:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

/**
 * PUT /api/tickets/[id]
 * Atualiza parcialmente um chamado
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const chamadoExistente = await prisma.chamado.findUnique({
      where: { id },
    });

    if (!chamadoExistente) {
      return NextResponse.json({ ok: false, message: "Chamado não encontrado" }, { status: 404 });
    }

    const updateData: any = {};

    if (body.titulo !== undefined) updateData.titulo = body.titulo;
    if (body.descricao !== undefined) updateData.descricao = body.descricao;
    if (body.tipo !== undefined) updateData.tipo = body.tipo as any;
    if (body.categoria !== undefined) updateData.categoria = body.categoria as any;
    if (body.prioridade !== undefined) updateData.prioridade = body.prioridade as any;
    if (body.status !== undefined) updateData.status = body.status as any;
    if (body.unitId !== undefined) updateData.unitId = body.unitId || null;
    if (body.localAfetado !== undefined) updateData.localAfetado = body.localAfetado;
    if (body.solucao !== undefined) updateData.solucao = body.solucao;
    if (body.custo !== undefined) updateData.custo = body.custo as any;
    if (body.dataPrevisao !== undefined) {
      updateData.dataPrevisao = body.dataPrevisao ? new Date(body.dataPrevisao) : null;
    }
    if (body.dataResolucao !== undefined) {
      updateData.dataResolucao = body.dataResolucao ? new Date(body.dataResolucao) : null;
    }
    if (body.observacoes !== undefined) updateData.observacoes = body.observacoes;

    // Se o status mudar para CONCLUIDO e antes não era, define dataResolucao automaticamente
    if (
      body.status === "CONCLUIDO" &&
      (chamadoExistente as any).status !== "CONCLUIDO"
    ) {
      updateData.dataResolucao = new Date();
    }

    const updated = await prisma.chamado.update({
      where: { id },
      data: updateData,
      include: unitInclude,
    });

    return NextResponse.json({
      ok: true,
      data: {
        ...updated,
        custo: (updated as any).custo?.toNumber() ?? null,
      },
    });
  } catch (e: any) {
    console.error("Erro ao atualizar chamado:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

/**
 * DELETE /api/tickets/[id]
 * Exclui um chamado
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const chamadoExistente = await prisma.chamado.findUnique({
      where: { id },
    });

    if (!chamadoExistente) {
      return NextResponse.json({ ok: false, message: "Chamado não encontrado" }, { status: 404 });
    }

    await prisma.chamado.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true, message: "Chamado excluído" });
  } catch (e: any) {
    console.error("Erro ao excluir chamado:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
