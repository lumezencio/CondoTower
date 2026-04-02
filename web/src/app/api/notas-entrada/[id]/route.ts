import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helper: map Decimal fields of a RetencaoImposto record to plain numbers
function mapRetencao(r: any) {
  return {
    ...r,
    baseCalculo: r.baseCalculo?.toNumber?.() ?? r.baseCalculo,
    aliquota: r.aliquota?.toNumber?.() ?? r.aliquota,
    valorRetido: r.valorRetido?.toNumber?.() ?? r.valorRetido,
  };
}

// Helper: map Decimal fields of a NotaEntrada record to plain numbers
function mapNota(nota: any) {
  return {
    ...nota,
    valorBruto: nota.valorBruto?.toNumber?.() ?? nota.valorBruto,
    valorLiquido: nota.valorLiquido?.toNumber?.() ?? nota.valorLiquido ?? null,
    retencoes: (nota.retencoes ?? []).map(mapRetencao),
  };
}

/**
 * Calls the Python backend to (re)calculate tax withholdings for a nota.
 * Returns the parsed retencoes array, or null if the backend is unreachable.
 */
async function calcularImpostosBackend(payload: {
  valor_bruto: number;
  tipo_fornecedor: string;
  tipo_servico: string;
  cnpj_fornecedor?: string | null;
  simples_nacional: boolean;
  aliquota_iss: number;
}): Promise<any[] | null> {
  try {
    const res = await fetch("http://localhost:8000/api/v1/notas-entrada/calcular-impostos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json?.retencoes ?? json?.data?.retencoes ?? null;
  } catch {
    return null;
  }
}

/**
 * GET /api/notas-entrada/[id]
 * Retorna uma nota de entrada com suas retenções de impostos.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const nota = await prisma.notaEntrada.findUnique({
      where: { id },
      include: { retencoes: true },
    });

    if (!nota || nota.tenant !== "parkclub") {
      return NextResponse.json(
        { ok: false, message: "Nota de entrada não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: mapNota(nota) });
  } catch (e: any) {
    console.error("Erro ao buscar nota de entrada:", e);
    return NextResponse.json(
      { ok: false, message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notas-entrada/[id]
 * Atualiza campos editáveis da nota: status, observacoes, xmlUrl, pdfUrl.
 *
 * Special action – body: { action: "recalcular" }
 * Calls the Python backend to recalculate taxes, replaces all retencoes and
 * updates valorLiquido / status accordingly.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const nota = await prisma.notaEntrada.findUnique({
      where: { id },
      include: { retencoes: true },
    });

    if (!nota || nota.tenant !== "parkclub") {
      return NextResponse.json(
        { ok: false, message: "Nota de entrada não encontrada" },
        { status: 404 }
      );
    }

    // --- Special action: recalcular ---
    if (body?.action === "recalcular") {
      const retencoesPython = await calcularImpostosBackend({
        valor_bruto: nota.valorBruto.toNumber(),
        tipo_fornecedor: nota.tipoFornecedor,
        tipo_servico: nota.tipoServico,
        cnpj_fornecedor: nota.cnpjFornecedor ?? null,
        simples_nacional: nota.simplesNacional,
        aliquota_iss: 0.05,
      });

      if (!retencoesPython || !Array.isArray(retencoesPython)) {
        return NextResponse.json(
          { ok: false, message: "Serviço de cálculo de impostos indisponível" },
          { status: 503 }
        );
      }

      const totalRetido = retencoesPython.reduce(
        (sum: number, r: any) => sum + Number(r.valor_retido ?? r.valorRetido ?? 0),
        0
      );
      const valorLiquido = nota.valorBruto.toNumber() - totalRetido;

      await prisma.$transaction(async (tx) => {
        // Remove existing retencoes before replacing
        await tx.retencaoImposto.deleteMany({ where: { notaEntradaId: id } });

        for (const r of retencoesPython) {
          await tx.retencaoImposto.create({
            data: {
              tenant: "parkclub",
              notaEntradaId: id,
              tipoImposto: (r.tipo_imposto ?? r.tipoImposto) as any,
              baseCalculo: Number(r.base_calculo ?? r.baseCalculo ?? nota.valorBruto.toNumber()) as any,
              aliquota: Number(r.aliquota) as any,
              valorRetido: Number(r.valor_retido ?? r.valorRetido) as any,
              codigoRecolhimento: r.codigo_recolhimento ?? r.codigoRecolhimento ?? null,
              dataVencimento: r.data_vencimento
                ? new Date(r.data_vencimento)
                : r.dataVencimento
                  ? new Date(r.dataVencimento)
                  : new Date(),
              status: "PENDING",
              observacoes: r.observacoes ?? null,
            },
          });
        }

        await tx.notaEntrada.update({
          where: { id },
          data: {
            valorLiquido: valorLiquido as any,
            status: "PROCESSADA",
          },
        });
      });

      const notaAtualizada = await prisma.notaEntrada.findUnique({
        where: { id },
        include: { retencoes: true },
      });

      return NextResponse.json({ ok: true, data: mapNota(notaAtualizada) });
    }

    // --- Standard field update ---
    const updateData: any = {};

    if (body.status !== undefined) updateData.status = body.status;
    if (body.observacoes !== undefined) updateData.observacoes = body.observacoes?.trim() ?? null;
    if (body.xmlUrl !== undefined) updateData.xmlUrl = body.xmlUrl?.trim() ?? null;
    if (body.pdfUrl !== undefined) updateData.pdfUrl = body.pdfUrl?.trim() ?? null;

    const updated = await prisma.notaEntrada.update({
      where: { id },
      data: updateData,
      include: { retencoes: true },
    });

    return NextResponse.json({ ok: true, data: mapNota(updated) });
  } catch (e: any) {
    console.error("Erro ao atualizar nota de entrada:", e);
    return NextResponse.json(
      { ok: false, message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notas-entrada/[id]
 * Exclui a nota de entrada e suas retenções (cascade via Prisma schema).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const nota = await prisma.notaEntrada.findUnique({
      where: { id },
    });

    if (!nota || nota.tenant !== "parkclub") {
      return NextResponse.json(
        { ok: false, message: "Nota de entrada não encontrada" },
        { status: 404 }
      );
    }

    await prisma.notaEntrada.delete({ where: { id } });

    return NextResponse.json({ ok: true, message: "Nota de entrada excluída com sucesso" });
  } catch (e: any) {
    console.error("Erro ao excluir nota de entrada:", e);
    return NextResponse.json(
      { ok: false, message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
