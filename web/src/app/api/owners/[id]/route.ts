import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/owners/[id]
 * Retorna um proprietario/inquilino especifico
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const owner = await prisma.owner.findUnique({
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

    if (!owner) {
      return NextResponse.json(
        { ok: false, message: "Registro nao encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: owner });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/owners/[id]
 * Atualiza um proprietario/inquilino existente
 */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Verifica se existe
    const existing = await prisma.owner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { ok: false, message: "Registro nao encontrado" },
        { status: 404 }
      );
    }

    const name = String(body?.name ?? "").trim().toUpperCase();
    const cpf = String(body?.cpf ?? "").replace(/\D/g, "").trim();

    // Validacoes obrigatorias
    if (!name) {
      return NextResponse.json(
        { ok: false, message: "Nome e obrigatorio" },
        { status: 400 }
      );
    }

    if (!cpf || cpf.length !== 11) {
      return NextResponse.json(
        { ok: false, message: "CPF e obrigatorio e deve ter 11 digitos" },
        { status: 400 }
      );
    }

    // Verifica se o CPF ja existe no tenant (exceto o proprio registro)
    if (cpf !== existing.cpf) {
      const existingCpf = await prisma.owner.findFirst({
        where: {
          tenant: existing.tenant,
          cpf,
          NOT: { id },
        },
      });

      if (existingCpf) {
        return NextResponse.json(
          { ok: false, message: "CPF ja cadastrado no sistema" },
          { status: 409 }
        );
      }
    }

    // Se mudou de unidade, verifica se ja existe do mesmo tipo na nova unidade
    const unitId = body?.unitId ?? existing.unitId;
    const type = body?.type ?? existing.type;

    if (unitId !== existing.unitId || type !== existing.type) {
      const existingType = await prisma.owner.findFirst({
        where: {
          tenant: existing.tenant,
          unitId,
          type: type as any,
          NOT: { id },
        },
      });

      if (existingType) {
        const tipoLabel = type === "PROPRIETARIO" ? "Proprietario" : "Inquilino";
        return NextResponse.json(
          { ok: false, message: `Ja existe um ${tipoLabel} cadastrado para esta unidade` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.owner.update({
      where: { id },
      data: {
        unitId,
        type: type as any,
        name,
        cpf,
        rg: body?.rg?.toUpperCase() || null,
        phone: body?.phone?.replace(/\D/g, "") || null,
        phone2: body?.phone2?.replace(/\D/g, "") || null,
        email: body?.email?.trim().toUpperCase() || null,
        birthDate: body?.birthDate ? new Date(body.birthDate) : null,
        profession: body?.profession?.trim().toUpperCase() || null,
        billingStreet: body?.billingStreet?.trim().toUpperCase() || null,
        billingNumber: body?.billingNumber?.trim().toUpperCase() || null,
        billingComplement: body?.billingComplement?.trim().toUpperCase() || null,
        billingNeighborhood: body?.billingNeighborhood?.trim().toUpperCase() || null,
        billingCity: body?.billingCity?.trim().toUpperCase() || null,
        billingState: body?.billingState?.trim().toUpperCase() || null,
        billingZip: body?.billingZip?.replace(/\D/g, "") || null,
        contractStart: body?.contractStart ? new Date(body.contractStart) : null,
        contractEnd: body?.contractEnd ? new Date(body.contractEnd) : null,
        rentValue: body?.rentValue ?? null,
        notes: body?.notes?.trim().toUpperCase() || null,
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
    return NextResponse.json(
      { ok: false, message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/owners/[id]
 * Remove um proprietario/inquilino
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Verifica se existe
    const existing = await prisma.owner.findUnique({
      where: { id },
      include: {
        unit: {
          select: {
            block: true,
            number: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, message: "Registro nao encontrado" },
        { status: 404 }
      );
    }

    await prisma.owner.delete({ where: { id } });

    const tipoLabel = existing.type === "PROPRIETARIO" ? "Proprietario" : "Inquilino";

    return NextResponse.json({
      ok: true,
      message: `${tipoLabel} ${existing.name} removido com sucesso`,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
