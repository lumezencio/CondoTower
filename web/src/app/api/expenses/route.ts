import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/expenses
 * Lista despesas/contas a pagar com filtros avançados
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 20);
    const status = searchParams.get("status") ?? "";
    const category = searchParams.get("category") ?? "";
    const search = searchParams.get("search") ?? "";
    const unitId = searchParams.get("unitId") ?? "";
    const startDate = searchParams.get("startDate") ?? "";
    const endDate = searchParams.get("endDate") ?? "";

    const where: any = { tenant: "parkclub" };

    if (status) where.status = status;
    if (category) where.category = category;
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
      prisma.expense.findMany({
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
        },
      }),
      prisma.expense.count({ where }),
    ]);

    const expenses = data.map((e: any) => ({
      ...e,
      amount: e.amount?.toNumber() || 0,
    }));

    return NextResponse.json({ ok: true, data: expenses, total, page, pageSize });
  } catch (e: any) {
    console.error("Erro ao listar despesas:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

/**
 * POST /api/expenses
 * Cria nova despesa/conta a pagar
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const description = String(body?.description ?? "").trim();
    const category = String(body?.category ?? "").trim();
    const amount = Number(body?.amount ?? 0);
    const dueDate = body?.dueDate;

    if (!description) {
      return NextResponse.json({ ok: false, message: "Descrição é obrigatória" }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ ok: false, message: "Categoria é obrigatória" }, { status: 400 });
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ ok: false, message: "Valor deve ser maior que zero" }, { status: 400 });
    }
    if (!dueDate) {
      return NextResponse.json({ ok: false, message: "Data de vencimento é obrigatória" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        tenant: "parkclub",
        description,
        category: category as any,
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

    return NextResponse.json({ ok: true, data: expense }, { status: 201 });
  } catch (e: any) {
    console.error("Erro ao criar despesa:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

/**
 * PUT /api/expenses/:id
 * Atualiza despesa/conta a pagar
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      return NextResponse.json({ ok: false, message: "Despesa não encontrada" }, { status: 404 });
    }

    const updateData: any = {};

    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.category !== undefined) updateData.category = body.category;
    if (body.amount !== undefined) {
      const amount = Number(body.amount);
      if (amount <= 0) {
        return NextResponse.json({ ok: false, message: "Valor deve ser maior que zero" }, { status: 400 });
      }
      updateData.amount = amount as any;
    }
    if (body.dueDate !== undefined) updateData.dueDate = new Date(body.dueDate);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.paymentMethod !== undefined) updateData.paymentMethod = body.paymentMethod;
    if (body.receiptUrl !== undefined) updateData.receiptUrl = body.receiptUrl;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.paymentDate !== undefined) {
      updateData.paymentDate = body.paymentDate ? new Date(body.paymentDate) : null;
    }

    // Se estiver marcando como paga, define data do pagamento
    if (body.status === "PAID" && expense.status !== "PAID") {
      updateData.paymentDate = new Date();
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: updateData,
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
    console.error("Erro ao atualizar despesa:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

/**
 * DELETE /api/expenses/:id
 * Exclui despesa
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      return NextResponse.json({ ok: false, message: "Despesa não encontrada" }, { status: 404 });
    }

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true, message: "Despesa excluída com sucesso" });
  } catch (e: any) {
    console.error("Erro ao excluir despesa:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
