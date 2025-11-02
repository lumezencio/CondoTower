import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

export async function GET() {
  const raw = process.env.DATABASE_URL || "";
  const masked = raw.replace(/\/\/([^:]+):([^@]+)@/, (_m,u,_p)=>`//${u}:***@`);

  try {
    const prisma = new PrismaClient();
    const ping = await prisma.$queryRaw`SELECT 1 AS ok`;
    const users = await prisma.user.count().catch(()=>-1);
    await prisma.$disconnect();

    return NextResponse.json({
      ok: true,
      DATABASE_URL: masked,
      db_ok: Array.isArray(ping) ? ping[0]?.ok === 1 : false,
      users
    });
  } catch (e:any) {
    return NextResponse.json({
      ok: false,
      DATABASE_URL: masked,
      error: String(e?.message || e)
    }, { status: 500 });
  }
}
