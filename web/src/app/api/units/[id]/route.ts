import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/units/[id]
 * Retorna uma unidade específica
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const unit = await prisma.unit.findUnique({
      where: { id },
      include: {
        residents: true,
        vehicles: true,
        _count: {
          select: {
            residents: true,
            vehicles: true,
          },
        },
      },
    });

    if (!unit) {
      return NextResponse.json(
        { ok: false, message: "Unidade não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: unit });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/units/[id]
 * Atualiza uma unidade existente
 */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Verifica se existe
    const existing = await prisma.unit.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { ok: false, message: "Unidade não encontrada" },
        { status: 404 }
      );
    }

    const block = String(body?.block ?? "").trim();
    const number = String(body?.number ?? body?.apartment ?? "").trim();

    if (!block || !number) {
      return NextResponse.json(
        { ok: false, message: "Bloco e número são obrigatórios" },
        { status: 400 }
      );
    }

    // Verifica duplicidade (se mudou block/number)
    if (block !== existing.block || number !== existing.number) {
      const duplicate = await prisma.unit.findFirst({
        where: {
          tenant: existing.tenant,
          block,
          number,
          NOT: { id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { ok: false, message: `Já existe uma unidade Bloco ${block} - ${number}` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.unit.update({
      where: { id },
      data: {
        block,
        number,
        areaM2: body?.areaM2 ?? null,
        bedrooms: body?.bedrooms ?? null,
        parkingSpots: body?.parkingSpots ?? null,
        notes: body?.notes ?? null,
      },
      include: {
        _count: {
          select: {
            residents: true,
            vehicles: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/units/[id]
 * Remove uma unidade (cascade para moradores e veículos)
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Verifica se existe
    const existing = await prisma.unit.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            residents: true,
            vehicles: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, message: "Unidade não encontrada" },
        { status: 404 }
      );
    }

    // Aviso sobre dados vinculados
    const totalVinculados = (existing._count?.residents ?? 0) + (existing._count?.vehicles ?? 0);
    if (totalVinculados > 0) {
      // Cascade vai remover os vinculados automaticamente (definido no schema)
      console.log(
        `[UNITS] Removendo unidade ${existing.block}-${existing.number} com ${existing._count?.residents} moradores e ${existing._count?.vehicles} veículos`
      );
    }

    await prisma.unit.delete({ where: { id } });

    return NextResponse.json({
      ok: true,
      message: `Unidade ${existing.block}-${existing.number} removida com sucesso`,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
