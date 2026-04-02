import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/revenues
 * Lista receitas/contas a receber com filtros avançados
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 20);
    const status = searchParams.get("status") ?? "";
    const type = searchParams.get("type") ?? "";
    const search = searchParams.get("search") ?? "";
    const unitId = searchParams.get("unitId") ?? "";
    const startDate = searchParams.get("startDate") ?? "";
    const endDate = searchParams.get("endDate") ?? "";

    const where: any = { tenant: "parkclub" };

    if (status) where.status = status;
    if (type) where.type = type;
    if (unitId) where.unitId = unitId;

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = new Date(startDate);
      if (endDate) where.dueDate.lte = new Date(endDate);
    }

    if (search) {
      where.description = {
        contains: search,
        mode: "insensitive",
      };
    }

    const [data, total] = await Promise.all([
      prisma.revenue.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
        include: {
          unit: {
            select: {
              id: true,
              block: true,
              number: true,
            },
          },
          taxWithholdings: {
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      prisma.revenue.count({ where }),
    ]);

    const revenues = data.map((r: any) => ({
      ...r,
      amount: r.amount?.toNumber() || 0,
      taxWithholdings: r.taxWithholdings?.map((t: any) => ({
        ...t,
        baseAmount: t.baseAmount?.toNumber() || 0,
        taxAmount: t.taxAmount?.toNumber() || 0,
      })),
    }));

    return NextResponse.json({ ok: true, data: revenues, total, page, pageSize });
  } catch (e: any) {
    console.error("Erro ao listar receitas:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

/**
 * POST /api/revenues
 * Cria nova receita/conta a receber
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const description = String(body?.description ?? "").trim();
    const type = String(body?.type ?? "").trim();
    const amount = Number(body?.amount ?? 0);
    const dueDate = body?.dueDate;

    if (!description) {
      return NextResponse.json({ ok: false, message: "Descrição é obrigatória" }, { status: 400 });
    }
    if (!type) {
      return NextResponse.json({ ok: false, message: "Tipo é obrigatório" }, { status: 400 });
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ ok: false, message: "Valor deve ser maior que zero" }, { status: 400 });
    }
    if (!dueDate) {
      return NextResponse.json({ ok: false, message: "Data de vencimento é obrigatória" }, { status: 400 });
    }

    const revenue = await prisma.revenue.create({
      data: {
        tenant: "parkclub",
        description,
        type: type as any,
        amount: amount as any,
        dueDate: new Date(dueDate),
        status: body?.status || "PENDING",
        unitId: body?.unitId || null,
        paymentMethod: body?.paymentMethod?.trim() || null,
        receiptUrl: body?.receiptUrl || null,
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

    return NextResponse.json({ ok: true, data: revenue }, { status: 201 });
  } catch (e: any) {
    console.error("Erro ao criar receita:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

