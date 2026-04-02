import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const em = String(email || "").trim().toLowerCase();
    const pw = String(password || "");

    if (!em || !pw) {
      return NextResponse.json({ ok: false, message: "Credenciais inválidas" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: em } });
    if (!user) {
      return NextResponse.json({ ok: false, message: "Usuário não encontrado" }, { status: 401 });
    }

    // O schema usa 'password' não 'password_hash'
    const ok = await bcrypt.compare(pw, user.password);
    if (!ok) {
      return NextResponse.json({ ok: false, message: "Senha incorreta" }, { status: 401 });
    }

    const payload = Buffer.from(JSON.stringify({ t: "parkclub", u: user.id })).toString("base64url");
    const res = NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email },
      tenant: "parkclub",
    });
    res.cookies.set("auth", payload, { httpOnly: true, sameSite: "lax", path: "/" });
    return res;
  } catch (e: any) {
    console.error("LOGIN_ERROR:", e?.message || e);
    return NextResponse.json({ ok: false, message: "Erro interno no login" }, { status: 500 });
  }
}
