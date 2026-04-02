import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PUT /api/revenues/:id
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const revenue = await prisma.revenue.findUnique({ where: { id } });
    if (!revenue) {
      return NextResponse.json({ ok: false, message: "Receita não encontrada" }, { status: 404 });
    }

    const updateData: any = {};

    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.type !== undefined) updateData.type = body.type;
    if (body.amount !== undefined) {
      const amount = Number(body.amount);
      if (amount <= 0) {
        return NextResponse.json({ ok: false, message: "Valor deve ser maior que zero" }, { status: 400 });
      }
      updateData.amount = amount as any;
    }
    if (body.dueDate !== undefined) updateData.dueDate = new Date(body.dueDate);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.paymentMethod !== undefined) updateData.paymentMethod = body.paymentMethod;
    if (body.receiptUrl !== undefined) updateData.receiptUrl = body.receiptUrl;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.receiptDate !== undefined) {
      updateData.receiptDate = body.receiptDate ? new Date(body.receiptDate) : null;
    }

    if (body.status === "PAID" && revenue.status !== "PAID") {
      updateData.receiptDate = new Date();
    }

    const updated = await prisma.revenue.update({
      where: { id },
      data: updateData,
      include: {
        unit: { select: { id: true, block: true, number: true } },
      },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (e: any) {
    console.error("Erro ao atualizar receita:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

/**
 * DELETE /api/revenues/:id
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const revenue = await prisma.revenue.findUnique({ where: { id } });
    if (!revenue) {
      return NextResponse.json({ ok: false, message: "Receita não encontrada" }, { status: 404 });
    }

    await prisma.revenue.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: "Receita excluída com sucesso" });
  } catch (e: any) {
    console.error("Erro ao excluir receita:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
