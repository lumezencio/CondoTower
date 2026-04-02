import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/messages
 * Lista recados/mensagens com filtros
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 20);
    
    const type = searchParams.get("type") ?? "";
    const status = searchParams.get("status") ?? "";
    const priority = searchParams.get("priority") ?? "";
    const unitId = searchParams.get("unitId") ?? "";

    const where: any = { tenant: "parkclub" };

    if (type) where.type = type;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (unitId) where.unitId = unitId;

    const [data, total] = await Promise.all([
      prisma.message.findMany({
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
      prisma.message.count({ where }),
    ]);

    return NextResponse.json({ ok: true, data, total, page, pageSize });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}

/**
 * POST /api/messages
 * Cria novo recado/mensagem
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const type = String(body?.type ?? "").trim();
    const subject = String(body?.subject ?? "").trim();
    const content = String(body?.content ?? "").trim();
    const fromName = String(body?.fromName ?? "").trim();

    if (!type || !["RECADO", "AVISO", "SOLICITACAO", "RECLAMACAO", "ELOGIO", "SUGESTAO"].includes(type)) {
      return NextResponse.json({ ok: false, message: "Tipo inválido" }, { status: 400 });
    }
    if (!subject) {
      return NextResponse.json({ ok: false, message: "Assunto é obrigatório" }, { status: 400 });
    }
    if (!content || content.length < 10) {
      return NextResponse.json({ ok: false, message: "Conteúdo deve ter pelo menos 10 caracteres" }, { status: 400 });
    }
    if (!fromName) {
      return NextResponse.json({ ok: false, message: "Nome do remetente é obrigatório" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        tenant: "parkclub",
        type: type as any,
        subject,
        content,
        priority: (body?.priority as string) || "NORMAL",
        status: "PENDENTE",
        fromName,
        fromEmail: body?.fromEmail?.trim() || null,
        fromPhone: body?.fromPhone?.trim() || null,
        toName: body?.toName?.trim() || "Administração",
        toEmail: body?.toEmail?.trim() || null,
        toPhone: body?.toPhone?.trim() || null,
        unitId: body?.unitId || null,
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

    return NextResponse.json({ ok: true, data: message }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: String(e?.message ?? e) }, { status: 500 });
  }
}
