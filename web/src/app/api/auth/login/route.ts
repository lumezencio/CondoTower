import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ ok:false, message:"Credenciais inválidas" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ ok:false, message:"Email ou senha incorretos" }, { status: 401 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ ok:false, message:"Email ou senha incorretos" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "devsecret");
    const token = await new SignJWT({ sub: user.id, role: user.role, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(secret);

    const res = NextResponse.json({ ok:true });
    res.cookies.set({
      name: "condotech_token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 2
    });
    return res;
  } catch (e) {
    return NextResponse.json({ ok:false, message:"Erro no login" }, { status: 500 });
  }
}
