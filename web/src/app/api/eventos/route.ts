import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);
    const status = searchParams.get("status") ?? "";
    const areaComumId = searchParams.get("areaComumId") ?? "";
    const search = searchParams.get("search") ?? "";
    const startDate = searchParams.get("startDate") ?? "";
    const endDate = searchParams.get("endDate") ?? "";

    const where: any = { tenant: "parkclub" };
    if (status) where.status = status;
    if (areaComumId) where.areaComumId = areaComumId;
    if (search) where.titulo = { contains: search, mode: "insensitive" };
    if (startDate || endDate) {
      where.dataInicio = {};
      if (startDate) where.dataInicio.gte = new Date(startDate);
      if (endDate) where.dataInicio.lte = new Date(endDate);
    }

    const [items, total] = await Promise.all([
      prisma.evento.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { dataInicio: "asc" },
        include: {
          areaComum: {
            select: { id: true, nome: true, tipo: true },
          },
          unit: {
            select: { id: true, block: true, number: true },
          },
        },
      }),
      prisma.evento.count({ where }),
    ]);

    const data = items.map((e) => ({
      ...e,
      valor: e.valor?.toNumber() ?? null,
    }));

    return NextResponse.json({ ok: true, data, total, page, pageSize });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const areaComumId = String(body?.areaComumId ?? "").trim();
    const titulo = String(body?.titulo ?? "").trim();
    const dataInicio = body?.dataInicio;
    const dataFim = body?.dataFim;

    if (!areaComumId) {
      return NextResponse.json({ ok: false, message: "Área comum é obrigatória" }, { status: 400 });
    }
    if (!titulo) {
      return NextResponse.json({ ok: false, message: "Título é obrigatório" }, { status: 400 });
    }
    if (!dataInicio) {
      return NextResponse.json({ ok: false, message: "Data de início é obrigatória" }, { status: 400 });
    }
    if (!dataFim) {
      return NextResponse.json({ ok: false, message: "Data de fim é obrigatória" }, { status: 400 });
    }

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (fim <= inicio) {
      return NextResponse.json(
        { ok: false, message: "Data de fim deve ser posterior à data de início" },
        { status: 400 }
      );
    }

    const evento = await prisma.evento.create({
      data: {
        tenant: "parkclub",
        areaComumId,
        titulo,
        dataInicio: inicio,
        dataFim: fim,
        status: "PENDENTE",
        unitId: body?.unitId || null,
        descricao: body?.descricao?.trim() || null,
        nomeResponsavel: body?.nomeResponsavel?.trim() || null,
        telefoneResponsavel: body?.telefoneResponsavel?.trim() || null,
        observacoes: body?.observacoes?.trim() || null,
        valor: body?.valor ?? null,
      },
      include: {
        areaComum: {
          select: { id: true, nome: true, tipo: true },
        },
        unit: {
          select: { id: true, block: true, number: true },
        },
      },
    });

    const data = { ...evento, valor: evento.valor?.toNumber() ?? null };

    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
