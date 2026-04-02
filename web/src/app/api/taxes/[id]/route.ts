import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PUT /api/taxes/:id
 * Atualiza imposto retido
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const tax = await prisma.taxWithholding.findUnique({ where: { id } });
    if (!tax) {
      return NextResponse.json({ ok: false, message: "Imposto não encontrado" }, { status: 404 });
    }

    const updateData: any = {};

    if (body.taxType !== undefined) updateData.taxType = body.taxType;
    if (body.baseAmount !== undefined) {
      const baseAmount = Number(body.baseAmount);
      if (baseAmount <= 0) {
        return NextResponse.json({ ok: false, message: "Valor base deve ser maior que zero" }, { status: 400 });
      }
      updateData.baseAmount = baseAmount as any;
      updateData.taxAmount = (baseAmount * Number(body.taxRate || tax.taxRate)) as any;
    }
    if (body.taxRate !== undefined) {
      updateData.taxRate = body.taxRate as any;
      updateData.taxAmount = (Number(body.baseAmount || tax.baseAmount) * Number(body.taxRate)) as any;
    }
    if (body.dueDate !== undefined) updateData.dueDate = new Date(body.dueDate);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.guideUrl !== undefined) updateData.guideUrl = body.guideUrl;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.paymentDate !== undefined) {
      updateData.paymentDate = body.paymentDate ? new Date(body.paymentDate) : null;
    }

    if (body.status === "PAID" && tax.status !== "PAID") {
      updateData.paymentDate = new Date();
    }

    const updated = await prisma.taxWithholding.update({
      where: { id },
      data: updateData,
      include: {
        revenue: {
          select: { id: true, description: true, type: true, amount: true },
        },
      },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (e: any) {
    console.error("Erro ao atualizar imposto:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

/**
 * DELETE /api/taxes/:id
 * Exclui imposto retido
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tax = await prisma.taxWithholding.findUnique({ where: { id } });
    if (!tax) {
      return NextResponse.json({ ok: false, message: "Imposto não encontrado" }, { status: 404 });
    }

    await prisma.taxWithholding.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: "Imposto excluído com sucesso" });
  } catch (e: any) {
    console.error("Erro ao excluir imposto:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
