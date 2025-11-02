import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.condominium.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  const { name, cnpj, address } = await req.json();
  if (!name || String(name).trim() === "") {
    return NextResponse.json({ ok: false, message: "Nome é obrigatório" }, { status: 400 });
  }
  const created = await prisma.condominium.create({
    data: { name: String(name).trim(), cnpj: cnpj || null, address: address || null },
  });
  return NextResponse.json({ ok: true, data: created }, { status: 201 });
}
