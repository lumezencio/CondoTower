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

    const contact = await prisma.contact.findFirst({
      where: { id, tenant: "parkclub" },
      include: {
        unit: {
          select: { id: true, block: true, number: true },
        },
      },
    });

    if (!contact) {
      return NextResponse.json({ ok: false, message: "Contato não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: contact });
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

    const existing = await prisma.contact.findFirst({
      where: { id, tenant: "parkclub" },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, message: "Contato não encontrado" }, { status: 404 });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.phone2 !== undefined) updateData.phone2 = body.phone2;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.unitId !== undefined) updateData.unitId = body.unitId;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const updated = await prisma.contact.update({
      where: { id },
      data: updateData,
      include: {
        unit: {
          select: { id: true, block: true, number: true },
        },
      },
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

    const existing = await prisma.contact.findFirst({
      where: { id, tenant: "parkclub" },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, message: "Contato não encontrado" }, { status: 404 });
    }

    await prisma.contact.delete({ where: { id } });

    return NextResponse.json({ ok: true, message: "Contato excluído com sucesso" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
