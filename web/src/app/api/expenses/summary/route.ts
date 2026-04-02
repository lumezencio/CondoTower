import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenant = searchParams.get("tenant") || "parkclub";

    const where: any = { tenant };

    const [total, pending, paid, overdue] = await Promise.all([
      prisma.expense.aggregate({
        where,
        _sum: { amount: true },
      }),
      prisma.expense.count({ where: { ...where, status: 'PENDING' } }),
      prisma.expense.count({ where: { ...where, status: 'PAID' } }),
      prisma.expense.count({ where: { ...where, status: 'OVERDUE' } }),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        total: total._sum.amount?.toNumber() || 0,
        pending,
        paid,
        overdue,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
