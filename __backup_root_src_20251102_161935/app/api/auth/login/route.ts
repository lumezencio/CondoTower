import { NextResponse } from "next/server";
import { getTenantPrisma } from "@/lib/tenant";
import bcrypt from "bcryptjs";

/** Login único (dev): usa DATABASE_URL do .env e grava cookie "auth". */
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const em = String(email || "").trim().toLowerCase();
    const pw = String(password || "");

    if (!em || !pw) {
      return NextResponse.json({ ok: false, message: "Credenciais inválidas" }, { status: 400 });
    }

    const prisma = getTenantPrisma(); // por enquanto, sem multi-tenant
    const user = await prisma.user.findUnique({ where: { email: em } });

    if (!user) {
      return NextResponse.json({ ok: false, message: "Usuário não encontrado" }, { status: 401 });
    }

    const ok = await bcrypt.compare(pw, user.password);
    if (!ok) {
      return NextResponse.json({ ok: false, message: "Senha incorreta" }, { status: 401 });
    }

    // cookie compatível com o front (id + slug fixo "parkclub" por enquanto)
    const payload = Buffer.from(JSON.stringify({ t: "parkclub", u: user.id })).toString("base64url");
    const resp = NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tenant: "parkclub",
    });
    resp.cookies.set("auth", payload, { httpOnly: true, sameSite: "lax", path: "/" });
    return resp;
  } catch (e: any) {
    // log amigável no dev
    console.error("LOGIN_ERROR:", e?.message || e);
    return NextResponse.json({ ok: false, message: "Erro interno no login", detail: String(e?.message || e) }, { status: 500 });
  }
}
