import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TENANT = process.env.TENANT_DEFAULT || "parkclub";

export async function GET() {
  const data = await prisma.unit.findMany({
    where: { tenant: TENANT },
    orderBy: [{ block: "asc" }, { number: "asc" }],
    include: { _count: { select: { residents: true, vehicles: true } } },
  });
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const { block, number, areaM2, bedrooms, parkingSpots, notes } = b || {};
  if (!block || !number)
    return NextResponse.json({ ok:false, message:"block e number são obrigatórios" }, { status:400 });

  const created = await prisma.unit.create({
    data: {
      tenant: TENANT,
      block: String(block),
      number: String(number),
      areaM2: areaM2 ? String(areaM2) : undefined,
      bedrooms: bedrooms ?? 0,
      parkingSpots: parkingSpots ?? 0,
      notes,
    },
  });
  return NextResponse.json({ ok: true, data: created }, { status: 201 });
}

