import { NextResponse } from "next/server";
import { getTenantPrisma } from "@/lib/tenant";
import bcrypt from "bcryptjs";

export const runtime = "nodejs"; // garante Node (e não Edge)

export async function POST(req: Request) {
  try {
    const url  = new URL(req.url);
    const slug = (url.searchParams.get("tenant") ?? process.env.DEFAULT_TENANT ?? "").trim();
    if (!slug) {
      return NextResponse.json({ ok:false, message:"Tenant ausente" }, { status:400 });
    }

    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ ok:false, message:"Credenciais inválidas" }, { status:400 });
    }

    const prisma = getTenantPrisma(slug);
    const user   = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ ok:false, message:"Usuário ou senha inválidos" }, { status:401 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ ok:false, message:"Usuário ou senha inválidos" }, { status:401 });
    }

    // simples cookie de sessão (placeholder)
    const res = NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tenant: slug,
    });
    res.cookies.set({
      name: "auth",
      value: JSON.stringify({ t: slug, u: user.id }),
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    return res;
  } catch (err: any) {
    console.error("LOGIN_ERROR:", err?.message ?? err);
    return NextResponse.json({ ok:false, message:"Erro interno no login" }, { status:500 });
  }
}
