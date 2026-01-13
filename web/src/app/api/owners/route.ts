import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/owners
 * Lista proprietarios e inquilinos com paginacao e filtros
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);

    const block = (searchParams.get("block") ?? "").trim();
    const unitId = (searchParams.get("unitId") ?? "").trim();
    const type = (searchParams.get("type") ?? "").trim();
    const name = (searchParams.get("name") ?? "").trim();
    const cpf = (searchParams.get("cpf") ?? "").trim();

    const where: any = {};

    if (unitId) {
      where.unitId = unitId;
    } else if (block) {
      where.unit = { block };
    }

    if (type && (type === "PROPRIETARIO" || type === "INQUILINO")) {
      where.type = type;
    }

    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }

    if (cpf) {
      where.cpf = { contains: cpf.replace(/\D/g, "") };
    }

    const [data, total] = await Promise.all([
      prisma.owner.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [
          { unit: { block: "asc" } },
          { unit: { number: "asc" } },
          { type: "asc" },
        ],
        include: {
          unit: {
            select: {
              id: true,
              block: true,
              number: true,
            },
          },
        },
      }),
      prisma.owner.count({ where }),
    ]);

    return NextResponse.json({ ok: true, data, total, page, pageSize });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/owners
 * Cria novo proprietario ou inquilino
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const unitId = String(body?.unitId ?? "").trim();
    const type = String(body?.type ?? "").trim();
    const name = String(body?.name ?? "").trim().toUpperCase();
    const cpf = String(body?.cpf ?? "").replace(/\D/g, "").trim();

    // Validacoes obrigatorias
    if (!unitId) {
      return NextResponse.json(
        { ok: false, message: "Unidade e obrigatoria" },
        { status: 400 }
      );
    }

    if (!type || (type !== "PROPRIETARIO" && type !== "INQUILINO")) {
      return NextResponse.json(
        { ok: false, message: "Tipo deve ser PROPRIETARIO ou INQUILINO" },
        { status: 400 }
      );
    }

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

    // Verifica se a unidade existe
    const unit = await prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) {
      return NextResponse.json(
        { ok: false, message: "Unidade nao encontrada" },
        { status: 404 }
      );
    }

    // Verifica se ja existe um proprietario/inquilino do mesmo tipo na unidade
    const existingType = await prisma.owner.findFirst({
      where: {
        tenant: unit.tenant,
        unitId,
        type: type as any,
      },
    });

    if (existingType) {
      const tipoLabel = type === "PROPRIETARIO" ? "Proprietario" : "Inquilino";
      return NextResponse.json(
        { ok: false, message: `Ja existe um ${tipoLabel} cadastrado para esta unidade` },
        { status: 409 }
      );
    }

    // Verifica se o CPF ja existe no tenant
    const existingCpf = await prisma.owner.findFirst({
      where: {
        tenant: unit.tenant,
        cpf,
      },
    });

    if (existingCpf) {
      return NextResponse.json(
        { ok: false, message: "CPF ja cadastrado no sistema" },
        { status: 409 }
      );
    }

    const created = await prisma.owner.create({
      data: {
        tenant: unit.tenant,
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

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
