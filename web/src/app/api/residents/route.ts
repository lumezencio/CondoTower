import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/residents
 * Lista moradores com filtros e paginação
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);

    // Filtros
    const name = (searchParams.get("name") ?? "").trim();
    const block = (searchParams.get("block") ?? "").trim();
    const unitNumber = (searchParams.get("unitNumber") ?? searchParams.get("apartment") ?? "").trim();
    const role = (searchParams.get("role") ?? "").trim();
    const unitId = (searchParams.get("unitId") ?? "").trim();

    // Construir where clause
    const where: any = {};

    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }

    if (role) {
      where.role = role;
    }

    if (unitId) {
      where.unitId = unitId;
    }

    // Filtros por unidade (block/number)
    if (block || unitNumber) {
      where.unit = {};
      if (block) where.unit.block = block;
      if (unitNumber) where.unit.number = unitNumber;
    }

    const [data, total] = await Promise.all([
      prisma.resident.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ unit: { block: "asc" } }, { unit: { number: "asc" } }, { name: "asc" }],
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
      prisma.resident.count({ where }),
    ]);

    return NextResponse.json({ ok: true, data, total, page, pageSize });
  } catch (e: any) {
    console.error("RESIDENTS_GET_ERROR:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

/**
 * POST /api/residents
 * Cria um novo morador
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const unitId = String(body?.unitId ?? "").trim();
    const name = String(body?.name ?? "").trim();

    if (!unitId) {
      return NextResponse.json(
        { ok: false, message: "unitId é obrigatório" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { ok: false, message: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    // Verifica se a unidade existe
    const unit = await prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) {
      return NextResponse.json(
        { ok: false, message: "Unidade não encontrada" },
        { status: 404 }
      );
    }

    // Validar CPF único se informado
    const cpf = body?.cpf ? String(body.cpf).replace(/\D/g, "") : null;
    if (cpf) {
      const existingCpf = await prisma.resident.findFirst({
        where: { tenant: unit.tenant, cpf },
      });
      if (existingCpf) {
        return NextResponse.json(
          { ok: false, message: "CPF já cadastrado para outro morador" },
          { status: 409 }
        );
      }
    }

    const created = await prisma.resident.create({
      data: {
        tenant: unit.tenant,
        unitId,
        name,
        email: body?.email || null,
        phone: body?.phone || null,
        cpf,
        role: body?.role ?? "MORADOR",
        isOwner: Boolean(body?.isOwner ?? false),
        birthDate: body?.birthDate ? new Date(body.birthDate) : null,
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
    console.error("RESIDENTS_POST_ERROR:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
