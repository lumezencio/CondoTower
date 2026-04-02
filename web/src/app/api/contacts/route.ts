import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/contacts
 * Lista contatos da agenda com filtros
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 20);
    
    const type = searchParams.get("type") ?? "";
    const category = searchParams.get("category") ?? "";
    const search = searchParams.get("search") ?? "";
    const unitId = searchParams.get("unitId") ?? "";

    const where: any = { tenant: "parkclub" };

    if (type) where.type = type;
    if (category) where.category = category;
    if (unitId) where.unitId = unitId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: "asc" },
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
      prisma.contact.count({ where }),
    ]);

    return NextResponse.json({ ok: true, data, total, page, pageSize });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

/**
 * POST /api/contacts
 * Cria novo contato
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body?.name ?? "").trim();
    const type = String(body?.type ?? "").trim();
    const phone = String(body?.phone ?? "").trim();

    if (!name) {
      return NextResponse.json({ ok: false, message: "Nome é obrigatório" }, { status: 400 });
    }
    if (!type || !["MORADOR", "FUNCIONARIO", "FORNECEDOR", "EMERGENCIA", "OUTRO"].includes(type)) {
      return NextResponse.json({ ok: false, message: "Tipo inválido" }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ ok: false, message: "Telefone é obrigatório" }, { status: 400 });
    }

    const contact = await prisma.contact.create({
      data: {
        tenant: "parkclub",
        name,
        type: type as any,
        phone,
        phone2: body?.phone2?.trim() || null,
        email: body?.email?.trim() || null,
        category: body?.category?.trim() || null,
        department: body?.department?.trim() || null,
        unitId: body?.unitId || null,
        notes: body?.notes?.trim() || null,
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

    return NextResponse.json({ ok: true, data: contact }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
