import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/tickets
 * Lista chamados com filtros avançados
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);
    const status = searchParams.get("status") ?? "";
    const tipo = searchParams.get("tipo") ?? "";
    const categoria = searchParams.get("categoria") ?? "";
    const prioridade = searchParams.get("prioridade") ?? "";
    const search = searchParams.get("search") ?? "";
    const unitId = searchParams.get("unitId") ?? "";

    const where: any = { tenant: "parkclub" };

    if (status) where.status = status as any;
    if (tipo) where.tipo = tipo as any;
    if (categoria) where.categoria = categoria as any;
    if (prioridade) where.prioridade = prioridade as any;
    if (unitId) where.unitId = unitId;

    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: "insensitive" } },
        { descricao: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.chamado.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          unit: {
            select: {
              id: true,
              block: true,
              number: true,
            },
          },
        },
      }),
      prisma.chamado.count({ where }),
    ]);

    const chamados = data.map((c: any) => ({
      ...c,
      custo: c.custo?.toNumber() ?? null,
    }));

    return NextResponse.json({ ok: true, data: chamados, total, page, pageSize });
  } catch (e: any) {
    console.error("Erro ao listar chamados:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

/**
 * POST /api/tickets
 * Cria novo chamado
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const titulo = String(body?.titulo ?? "").trim();
    const tipo = String(body?.tipo ?? "").trim();
    const categoria = String(body?.categoria ?? "").trim();
    const prioridade = String(body?.prioridade ?? "").trim();
    const descricao = String(body?.descricao ?? "").trim();

    if (!titulo) {
      return NextResponse.json({ ok: false, message: "Título é obrigatório" }, { status: 400 });
    }
    if (!tipo) {
      return NextResponse.json({ ok: false, message: "Tipo é obrigatório" }, { status: 400 });
    }
    if (!categoria) {
      return NextResponse.json({ ok: false, message: "Categoria é obrigatória" }, { status: 400 });
    }
    if (!prioridade) {
      return NextResponse.json({ ok: false, message: "Prioridade é obrigatória" }, { status: 400 });
    }
    if (!descricao) {
      return NextResponse.json({ ok: false, message: "Descrição é obrigatória" }, { status: 400 });
    }

    const chamado = await prisma.chamado.create({
      data: {
        tenant: "parkclub",
        titulo,
        tipo: tipo as any,
        categoria: categoria as any,
        prioridade: prioridade as any,
        descricao,
        status: "ABERTO" as any,
        unitId: body?.unitId || null,
        localAfetado: body?.localAfetado?.trim() || null,
        dataPrevisao: body?.dataPrevisao ? new Date(body.dataPrevisao) : null,
        observacoes: body?.observacoes?.trim() || null,
      },
      include: {
        unit: {
          select: {
            id: true,
            block: true,
            number: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, data: chamado }, { status: 201 });
  } catch (e: any) {
    console.error("Erro ao criar chamado:", e);
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
