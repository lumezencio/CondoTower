import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tenant = new URL(req.url).searchParams.get("tenant") ?? "parkclub";

    const chamados = await prisma.chamado.findMany({
      where: { tenant },
      select: { status: true, tipo: true, categoria: true, prioridade: true, custo: true },
    });

    const total      = chamados.length;
    const abertos    = chamados.filter(c => c.status === "ABERTO").length;
    const emAnalise  = chamados.filter(c => c.status === "EM_ANALISE").length;
    const emAndamento= chamados.filter(c => c.status === "EM_ANDAMENTO").length;
    const concluidos = chamados.filter(c => c.status === "CONCLUIDO").length;
    const cancelados = chamados.filter(c => c.status === "CANCELADO").length;
    const custoTotal = chamados.reduce((s, c) => s + (c.custo?.toNumber() ?? 0), 0);

    return NextResponse.json({
      ok: true,
      data: {
        total, abertos, emAnalise, emAndamento, concluidos, cancelados, custoTotal,
        byTipo: {
          manutencao_preventiva: chamados.filter(c => c.tipo === "MANUTENCAO_PREVENTIVA").length,
          manutencao_corretiva:  chamados.filter(c => c.tipo === "MANUTENCAO_CORRETIVA").length,
          solicitacao_servico:   chamados.filter(c => c.tipo === "SOLICITACAO_SERVICO").length,
          reclamacao:            chamados.filter(c => c.tipo === "RECLAMACAO").length,
          sugestao:              chamados.filter(c => c.tipo === "SUGESTAO").length,
          emergencia:            chamados.filter(c => c.tipo === "EMERGENCIA").length,
        },
        byCategoria: {
          eletrica:      chamados.filter(c => c.categoria === "ELETRICA").length,
          hidraulica:    chamados.filter(c => c.categoria === "HIDRAULICA").length,
          elevador:      chamados.filter(c => c.categoria === "ELEVADOR").length,
          ar_condicionado:chamados.filter(c => c.categoria === "AR_CONDICIONADO").length,
          piscina:       chamados.filter(c => c.categoria === "PISCINA").length,
          jardim:        chamados.filter(c => c.categoria === "JARDIM").length,
          limpeza:       chamados.filter(c => c.categoria === "LIMPEZA").length,
          seguranca:     chamados.filter(c => c.categoria === "SEGURANCA").length,
          estrutural:    chamados.filter(c => c.categoria === "ESTRUTURAL").length,
          outro:         chamados.filter(c => c.categoria === "OUTRO").length,
        },
        byPrioridade: {
          baixa:     chamados.filter(c => c.prioridade === "BAIXA").length,
          media:     chamados.filter(c => c.prioridade === "MEDIA").length,
          alta:      chamados.filter(c => c.prioridade === "ALTA").length,
          urgente:   chamados.filter(c => c.prioridade === "URGENTE").length,
          emergencia:chamados.filter(c => c.prioridade === "EMERGENCIA").length,
        },
      },
    });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, message: String((e as Error)?.message ?? e) }, { status: 500 });
  }
}
