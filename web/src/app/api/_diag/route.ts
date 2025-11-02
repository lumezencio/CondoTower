import { NextResponse } from "next/server";
import { prismaForTenant, tenantUrl } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenant = (url.searchParams.get("tenant") || process.env.DEFAULT_TENANT || "default").toLowerCase();
    const prisma = prismaForTenant(tenant);
    const count = await prisma.user.count();
    return NextResponse.json({ ok:true, tenant, url: tenantUrl(tenant), userCount: count, hasBase: !!process.env.DATABASE_URL_BASE });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || String(e) }, { status: 500 });
  }
}
