import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/taxes
 * Lista impostos retidos com filtros
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);
    const status = searchParams.get("status") ?? "";
    const taxType = searchParams.get("taxType") ?? "";
    const revenueId = searchParams.get("revenueId") ?? "";

    const where: any = { tenant: "parkclub" };

    if (status) where.status = status;
    if (taxType) where.taxType = taxType;
    if (revenueId) where.revenueId = revenueId;

    const [data, total] = await Promise.all([
      prisma.taxWithholding.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
        include: {
          revenue: {
            select: {
              id: true,
              description: true,
              type: true,
              amount: true,
              unit: {
                select: {
                  block: true,
                  number: true,
                },
              },
            },
          },
        },
      }),
      prisma.taxWithholding.count({ where }),
    ]);

    return NextResponse.json({ ok: true, data, total, page, pageSize });
  } catch (e: any) {
    console.error("Erro ao listar impostos:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

/**
 * POST /api/taxes
 * Cria novo imposto retido
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const revenueId = String(body?.revenueId ?? "").trim();
    const taxType = String(body?.taxType ?? "").trim();
    const baseAmount = Number(body?.baseAmount ?? 0);
    const taxRate = Number(body?.taxRate ?? 0);
    const dueDate = body?.dueDate;

    if (!revenueId) {
      return NextResponse.json({ ok: false, message: "Receita é obrigatória" }, { status: 400 });
    }
    if (!taxType) {
      return NextResponse.json({ ok: false, message: "Tipo de imposto é obrigatório" }, { status: 400 });
    }
    if (!baseAmount || baseAmount <= 0) {
      return NextResponse.json({ ok: false, message: "Valor base deve ser maior que zero" }, { status: 400 });
    }
    if (!dueDate) {
      return NextResponse.json({ ok: false, message: "Data de vencimento é obrigatória" }, { status: 400 });
    }

    // Calcula valor do imposto
    const taxAmount = baseAmount * taxRate;

    const revenue = await prisma.revenue.findUnique({
      where: { id: revenueId },
    });

    if (!revenue) {
      return NextResponse.json({ ok: false, message: "Receita não encontrada" }, { status: 404 });
    }

    const tax = await prisma.taxWithholding.create({
      data: {
        tenant: "parkclub",
        revenueId,
        taxType: taxType as any,
        baseAmount: baseAmount as any,
        taxRate: taxRate as any,
        taxAmount: taxAmount as any,
        dueDate: new Date(dueDate),
        status: body?.status || "PENDING",
        guideUrl: body?.guideUrl || null,
        notes: body?.notes?.trim() || null,
      },
      include: {
        revenue: {
          select: {
            id: true,
            description: true,
            type: true,
            amount: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, data: tax }, { status: 201 });
  } catch (e: any) {
    console.error("Erro ao criar imposto:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

