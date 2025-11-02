import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("auth", "", { httpOnly: true, sameSite: "lax", secure: false, path: "/", expires: new Date(0) });
  return res;
}
