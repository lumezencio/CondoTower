import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/residents/[id]
 * Retorna um morador específico
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const resident = await prisma.resident.findUnique({
      where: { id },
      include: {
        unit: {
          select: {
            id: true,
            block: true,
            number: true,
          },
        },
      },
    });

    if (!resident) {
      return NextResponse.json(
        { ok: false, message: "Morador não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: resident });
  } catch (e: any) {
    console.error("RESIDENT_GET_ERROR:", e);
    return NextResponse.json(
      { ok: false, message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/residents/[id]
 * Atualiza um morador existente
 */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Verifica se existe
    const existing = await prisma.resident.findUnique({
      where: { id },
      include: { unit: true },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, message: "Morador não encontrado" },
        { status: 404 }
      );
    }

    const name = String(body?.name ?? "").trim();
    if (!name) {
      return NextResponse.json(
        { ok: false, message: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    // Validar CPF único se informado e diferente do atual
    const cpf = body?.cpf ? String(body.cpf).replace(/\D/g, "") : null;
    if (cpf && cpf !== existing.cpf) {
      const existingCpf = await prisma.resident.findFirst({
        where: {
          tenant: existing.tenant,
          cpf,
          NOT: { id },
        },
      });
      if (existingCpf) {
        return NextResponse.json(
          { ok: false, message: "CPF já cadastrado para outro morador" },
          { status: 409 }
        );
      }
    }

    // Se mudou de unidade, validar
    let unitId = existing.unitId;
    if (body?.unitId && body.unitId !== existing.unitId) {
      const newUnit = await prisma.unit.findUnique({ where: { id: body.unitId } });
      if (!newUnit) {
        return NextResponse.json(
          { ok: false, message: "Unidade não encontrada" },
          { status: 404 }
        );
      }
      unitId = body.unitId;
    }

    const updated = await prisma.resident.update({
      where: { id },
      data: {
        unitId,
        name,
        email: body?.email || null,
        phone: body?.phone || null,
        cpf,
        role: body?.role ?? existing.role,
        isOwner: body?.isOwner !== undefined ? Boolean(body.isOwner) : existing.isOwner,
        birthDate: body?.birthDate ? new Date(body.birthDate) : existing.birthDate,
      },
      include: {
        unit: {
          select: {
            id: true,
            block: true,
            number: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (e: any) {
    console.error("RESIDENT_PUT_ERROR:", e);
    return NextResponse.json(
      { ok: false, message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/residents/[id]
 * Remove um morador
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Verifica se existe
    const existing = await prisma.resident.findUnique({
      where: { id },
      include: { unit: true },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, message: "Morador não encontrado" },
        { status: 404 }
      );
    }

    await prisma.resident.delete({ where: { id } });

    return NextResponse.json({
      ok: true,
      message: `Morador ${existing.name} removido com sucesso`,
    });
  } catch (e: any) {
    console.error("RESIDENT_DELETE_ERROR:", e);
    return NextResponse.json(
      { ok: false, message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
