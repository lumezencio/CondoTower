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

    const approval = await prisma.approval.findFirst({
      where: { id, tenant: "parkclub" },
    });

    if (!approval) {
      return NextResponse.json({ ok: false, message: "Aprovação não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: approval });
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

    const existing = await prisma.approval.findFirst({
      where: { id, tenant: "parkclub" },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, message: "Aprovação não encontrada" }, { status: 404 });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.period !== undefined) updateData.period = body.period;
    if (body.documentUrl !== undefined) updateData.documentUrl = body.documentUrl;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.votes !== undefined) updateData.votes = body.votes;
    if (body.approvedBy !== undefined) updateData.approvedBy = body.approvedBy;
    if (body.approvedAt !== undefined) updateData.approvedAt = body.approvedAt ? new Date(body.approvedAt) : null;
    if (body.rejectionReason !== undefined) updateData.rejectionReason = body.rejectionReason;

    // If status changes to APROVADO, set approvedAt automatically
    if (body.status === "APROVADO" && existing.status !== "APROVADO") {
      updateData.approvedAt = new Date();
    }

    const updated = await prisma.approval.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ok: true, data: updated });
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

    const existing = await prisma.approval.findFirst({
      where: { id, tenant: "parkclub" },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, message: "Aprovação não encontrada" }, { status: 404 });
    }

    await prisma.approval.delete({ where: { id } });

    return NextResponse.json({ ok: true, message: "Aprovação excluída com sucesso" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
