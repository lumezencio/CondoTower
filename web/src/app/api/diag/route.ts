import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const raw = process.env.DATABASE_URL || "";
  const masked = raw.replace(/\/\/([^:]+):([^@]+)@/, (_m,u,_p)=>`//${u}:***@`);

  const out:any = { ok: true, DATABASE_URL: masked, db_ok: false, users: -1 };

  try {
    const prisma = new PrismaClient();
    const ping = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 AS ok`;
    out.db_ok = Array.isArray(ping) ? ping[0]?.ok === 1 : false;
    try { out.users = await prisma.user.count(); } catch { out.users = -1; }
    await prisma.$disconnect();
  } catch (e:any) {
    out.ok = false;
    out.error = String(e?.message || e);
  }

  return NextResponse.json(out, { status: out.ok ? 200 : 500 });
}
