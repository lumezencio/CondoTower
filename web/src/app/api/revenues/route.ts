import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);
    const status = searchParams.get("status") ?? "";
    const type = searchParams.get("type") ?? "";
    const search = searchParams.get("search") ?? "";

    const where: any = {};
    
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
      where.description = {
        contains: search,
        mode: 'insensitive'
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
              block: true,
              number: true
            }
          }
        }
      }),
      prisma.revenue.count({ where }),
    ]);

    return NextResponse.json({ ok: true, data, total, page, pageSize });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      description,
      type,
      amount,
      dueDate,
      unitId,
      paymentMethod,
      receiptUrl,
      notes
    } = body;

    if (!description || !type || !amount || !dueDate) {
      return NextResponse.json(
        { ok: false, message: "Descrição, tipo, valor e data de vencimento são obrigatórios" },
        { status: 400 }
      );
    }

    const revenue = await prisma.revenue.create({
      data: {
        description,
        type,
        amount: new Number(amount).valueOf() as any,
        dueDate: new Date(dueDate),
        unitId: unitId || null,
        paymentMethod: paymentMethod || null,
        receiptUrl: receiptUrl || null,
        notes: notes || null
      }
    });

    return NextResponse.json({ ok: true, data: revenue }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const {
      description,
      type,
      amount,
      dueDate,
      unitId,
      paymentMethod,
      receiptUrl,
      notes
    } = body;

    if (!description || !type || !amount || !dueDate) {
      return NextResponse.json(
        { ok: false, message: "Descrição, tipo, valor e data de vencimento são obrigatórios" },
        { status: 400 }
      );
    }

    const revenue = await prisma.revenue.update({
      where: { id: params.id },
      data: {
        description,
        type,
        amount: new Number(amount).valueOf() as any,
        dueDate: new Date(dueDate),
        unitId: unitId || null,
        paymentMethod: paymentMethod || null,
        receiptUrl: receiptUrl || null,
        notes: notes || null
      }
    });

    return NextResponse.json({ ok: true, data: revenue });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.revenue.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ ok: true, message: "Receita excluída com sucesso" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}