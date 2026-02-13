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
    const taxType = searchParams.get("taxType") ?? "";
    const search = searchParams.get("search") ?? "";

    const where: any = {};
    
    if (status) where.status = status;
    if (taxType) where.taxType = taxType;
    if (search) {
      where.notes = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const [data, total] = await Promise.all([
      prisma.taxWithholding.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
        include: {
          revenue: {
            include: {
              unit: {
                select: {
                  block: true,
                  number: true
                }
              }
            }
          }
        }
      }),
      prisma.taxWithholding.count({ where }),
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
      revenueId,
      taxType,
      baseAmount,
      taxRate,
      taxAmount,
      dueDate,
      guideUrl,
      notes
    } = body;

    if (!revenueId || !taxType || !baseAmount || !taxRate || !taxAmount || !dueDate) {
      return NextResponse.json(
        { ok: false, message: "Todos os campos obrigatórios devem ser preenchidos" },
        { status: 400 }
      );
    }

    const taxWithholding = await prisma.taxWithholding.create({
      data: {
        revenueId,
        taxType,
        baseAmount: new Number(baseAmount).valueOf() as any,
        taxRate: new Number(taxRate).valueOf() as any,
        taxAmount: new Number(taxAmount).valueOf() as any,
        dueDate: new Date(dueDate),
        guideUrl: guideUrl || null,
        notes: notes || null
      }
    });

    return NextResponse.json({ ok: true, data: taxWithholding }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const {
      revenueId,
      taxType,
      baseAmount,
      taxRate,
      taxAmount,
      dueDate,
      paymentDate,
      status,
      guideUrl,
      notes
    } = body;

    if (!revenueId || !taxType || !baseAmount || !taxRate || !taxAmount || !dueDate) {
      return NextResponse.json(
        { ok: false, message: "Todos os campos obrigatórios devem ser preenchidos" },
        { status: 400 }
      );
    }

    const taxWithholding = await prisma.taxWithholding.update({
      where: { id: params.id },
      data: {
        revenueId,
        taxType,
        baseAmount: new Number(baseAmount).valueOf() as any,
        taxRate: new Number(taxRate).valueOf() as any,
        taxAmount: new Number(taxAmount).valueOf() as any,
        dueDate: new Date(dueDate),
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        status,
        guideUrl: guideUrl || null,
        notes: notes || null
      }
    });

    return NextResponse.json({ ok: true, data: taxWithholding });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.taxWithholding.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ ok: true, message: "Imposto retido excluído com sucesso" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}