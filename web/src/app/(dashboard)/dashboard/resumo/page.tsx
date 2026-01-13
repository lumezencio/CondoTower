"use client";

import React, { useState, useMemo } from "react";
import {
  Gauge, Wallet, TrendingUp, TrendingDown, Calendar, MessageSquare,
  ChevronLeft, ChevronRight, Plus, DollarSign, PiggyBank, AlertTriangle,
  Clock, CheckCircle2, X, BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  CalendarDays, Users, FileText, Building2, Eye
} from "lucide-react";

/* ============================================
   TIPOS E DADOS MOCK
============================================ */

type ContaStatus = "vencida" | "agendada" | "a_vencer";

type Conta = {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: ContaStatus;
};

type Evento = {
  id: string;
  titulo: string;
  local: string;
  bloco: string;
  unidade: string;
  data: Date;
  horaInicio?: string;
  horaFim?: string;
  diaInteiro: boolean;
};

type Despesa = {
  grupo: string;
  classificacao: string;
  valor: number;
  cor: string;
};

// Dados mock para demonstracao
const MOCK_DATA = {
  saldoEmConta: 22353.08,
  contasReceber: {
    vencidas: { qtd: 129, valor: 17258.00 },
    aVencer: { qtd: 0, valor: 0 },
  },
  contasPagar: {
    vencidas: { qtd: 1, valor: 17.40 },
    agendadas: { qtd: 10, valor: 10972.41 },
    aVencer: { qtd: 26, valor: 33048.51 },
  },
  chamados: {
    totalMes: 3,
    emAberto: 3,
  },
  eventos: [
    { id: "1", titulo: "Vaga Visitante 01", local: "Estacionamento", bloco: "03", unidade: "101", data: new Date(2026, 0, 12), diaInteiro: true },
    { id: "2", titulo: "Vaga Visitante 03", local: "Estacionamento", bloco: "15", unidade: "203", data: new Date(2026, 0, 12), diaInteiro: true },
    { id: "3", titulo: "Vaga Visitante 07", local: "Estacionamento", bloco: "08", unidade: "401", data: new Date(2026, 0, 17), diaInteiro: true },
    { id: "4", titulo: "Salao de Festas / Churrasqueira", local: "Area Comum", bloco: "08", unidade: "401", data: new Date(2026, 0, 17), horaInicio: "11:00", horaFim: "16:30", diaInteiro: false },
    { id: "5", titulo: "Vaga Visitante 07", local: "Estacionamento", bloco: "08", unidade: "401", data: new Date(2026, 0, 18), diaInteiro: true },
  ] as Evento[],
  despesas: [
    { grupo: "CONTRATOS / PRESTADORES", classificacao: "ADMINISTRACAO DE CONDOMINIO/CONTRATO", valor: 33844.62, cor: "#374151" },
    { grupo: "DESPESAS ADMINISTRATIVAS", classificacao: "DEDETIZACAO/IMUNIZACAO/DESINFECCAO", valor: 4993.80, cor: "#10b981" },
    { grupo: "DESPESAS COM PESSOAL", classificacao: "EXAME MEDICO", valor: 6153.00, cor: "#84cc16" },
    { grupo: "DESPESAS FINANCEIRAS", classificacao: "MATERIAIS DIVERSOS", valor: 40.20, cor: "#ef4444" },
    { grupo: "MANUTENCAO E CONSERVACAO", classificacao: "MATERIAL DE CONSTRUCAO", valor: 4634.22, cor: "#3b82f6" },
    { grupo: "MATERIAIS", classificacao: "MATERIAL DE LIMPEZA", valor: 335.86, cor: "#f97316" },
  ] as Despesa[],
};

// Gerar fluxo de caixa para o mes
function generateFluxoCaixa(mes: number, ano: number) {
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const fluxo = [];
  let saldoAtual = MOCK_DATA.saldoEmConta;

  for (let dia = 1; dia <= diasNoMes; dia++) {
    const entrada = dia <= 11 ? 0 : Math.random() > 0.7 ? Math.random() * 5000 : 0;
    const saida = dia === 12 ? 11546.58 : dia === 15 ? 6077.26 : dia === 16 ? 982.35 : Math.random() > 0.6 ? Math.random() * 2000 : 0;

    const saldoInicial = saldoAtual;
    saldoAtual = saldoAtual + entrada - saida;

    fluxo.push({
      dia,
      saldoInicial: saldoInicial,
      entrada: entrada,
      saida: saida,
      saldoFinal: saldoAtual,
      realizado: dia <= 11,
    });
  }

  return fluxo;
}

const MESES = [
  "JANEIRO", "FEVEREIRO", "MARCO", "ABRIL", "MAIO", "JUNHO",
  "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
];

const DIAS_SEMANA = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

const GRUPOS_DESPESAS = [
  { nome: "TODAS", cor: null },
  { nome: "CONTRATOS / PRESTADORES", cor: "#374151" },
  { nome: "DESPESAS ADMINISTRATIVAS", cor: "#10b981" },
  { nome: "DESPESAS COM PESSOAL", cor: "#84cc16" },
  { nome: "DESPESAS FINANCEIRAS", cor: "#ef4444" },
  { nome: "MANUTENCAO E CONSERVACAO", cor: "#3b82f6" },
  { nome: "MATERIAIS", cor: "#f97316" },
];

/* ============================================
   COMPONENTES AUXILIARES
============================================ */

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatNumber(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Componente de Donut Chart simples com SVG
function DonutChart({ data, size = 200 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const radius = size / 2 - 20;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = 0;
  const segments = data.map((item) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (startAngle + angle - 90) * (Math.PI / 180);

    const x1 = size / 2 + radius * Math.cos(startRad);
    const y1 = size / 2 + radius * Math.sin(startRad);
    const x2 = size / 2 + radius * Math.cos(endRad);
    const y2 = size / 2 + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    return {
      ...item,
      percentage: (percentage * 100).toFixed(1),
      path: `M ${size / 2} ${size / 2} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
    };
  });

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {segments.map((seg, i) => (
          <path
            key={i}
            d={seg.path}
            fill={seg.color}
            className="transition-opacity hover:opacity-80 cursor-pointer"
          />
        ))}
        {/* Centro branco para fazer o donut */}
        <circle cx={size / 2} cy={size / 2} r={radius * 0.6} fill="currentColor" className="text-slate-900" />
      </svg>
      {/* Percentual central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">
          {segments[0]?.percentage}%
        </span>
      </div>
    </div>
  );
}

/* ============================================
   COMPONENTE PRINCIPAL
============================================ */

export default function ResumoGestaoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"resumo" | "fluxo" | "eventos" | "despesas">("resumo");

  // Estado para filtros
  const [mesSelecionado, setMesSelecionado] = useState(0); // Janeiro
  const [anoSelecionado, setAnoSelecionado] = useState(2026);
  const [grupoDespesaSelecionado, setGrupoDespesaSelecionado] = useState("TODAS");

  // Gerar fluxo de caixa
  const fluxoCaixa = useMemo(
    () => generateFluxoCaixa(mesSelecionado, anoSelecionado),
    [mesSelecionado, anoSelecionado]
  );

  // Data atual formatada
  const dataAtual = new Date();
  const dataFormatada = dataAtual.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).toUpperCase();

  // Calcular totais
  const totalReceber = MOCK_DATA.contasReceber.vencidas.valor + MOCK_DATA.contasReceber.aVencer.valor;
  const totalPagar = MOCK_DATA.contasPagar.vencidas.valor + MOCK_DATA.contasPagar.agendadas.valor + MOCK_DATA.contasPagar.aVencer.valor;

  // Dados para graficos
  const dadosGruposDespesas = useMemo(() => {
    const grupos: Record<string, number> = {};
    MOCK_DATA.despesas.forEach(d => {
      grupos[d.grupo] = (grupos[d.grupo] || 0) + d.valor;
    });
    return Object.entries(grupos).map(([grupo, valor]) => ({
      label: grupo,
      value: valor,
      color: GRUPOS_DESPESAS.find(g => g.nome === grupo)?.cor || "#6b7280",
    }));
  }, []);

  const dadosClassificacaoDespesas = useMemo(() => {
    const cores = ["#374151", "#10b981", "#84cc16", "#ef4444", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b"];
    return MOCK_DATA.despesas.map((d, i) => ({
      label: d.classificacao,
      value: d.valor,
      color: cores[i % cores.length],
    }));
  }, []);

  const totalDespesas = MOCK_DATA.despesas.reduce((acc, d) => acc + d.valor, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Gauge className="w-7 h-7 text-emerald-400" />
            Resumo de Gestao
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Visao geral financeira e operacional do condominio
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/25"
        >
          <Eye className="w-5 h-5" />
          Ver Detalhes
        </button>
      </div>

      {/* Cards Resumo Rapido */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo em Conta */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-emerald-300">Saldo em Conta</span>
            <PiggyBank className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(MOCK_DATA.saldoEmConta)}
          </div>
          <div className="text-xs text-slate-400 mt-2">Atualizado hoje</div>
        </div>

        {/* A Receber */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-green-500/20 to-emerald-500/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-green-300">A Receber</span>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(totalReceber)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded">
              {MOCK_DATA.contasReceber.vencidas.qtd} vencidas
            </span>
          </div>
        </div>

        {/* A Pagar */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-red-500/20 to-orange-500/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-red-300">A Pagar</span>
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(totalPagar)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded">
              {MOCK_DATA.contasPagar.vencidas.qtd} vencida
            </span>
            <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded">
              {MOCK_DATA.contasPagar.agendadas.qtd} agendadas
            </span>
          </div>
        </div>

        {/* Chamados */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/20 to-pink-500/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-purple-300">Chamados</span>
            <MessageSquare className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {MOCK_DATA.chamados.totalMes}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded">
              {MOCK_DATA.chamados.emAberto} em aberto
            </span>
          </div>
        </div>
      </div>

      {/* Proximos Eventos */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-orange-400" />
            Proximos Eventos & Reservas
          </h2>
          <button className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            Ver todos
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MOCK_DATA.eventos.slice(0, 3).map((evento) => (
            <div
              key={evento.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-white/5 hover:border-white/10 transition"
            >
              <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-orange-500/20 border border-orange-500/30">
                <span className="text-[10px] text-orange-300 font-medium">
                  {DIAS_SEMANA[evento.data.getDay()]}
                </span>
                <span className="text-xl font-bold text-white">
                  {evento.data.getDate()}
                </span>
                <span className="text-[10px] text-orange-300">
                  {MESES[evento.data.getMonth()].slice(0, 3)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{evento.titulo}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  BLOCO {evento.bloco}, N° {evento.unidade}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {evento.diaInteiro ? "O dia inteiro" : `${evento.horaInicio} as ${evento.horaFim}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-6xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Gauge className="w-5 h-5 text-emerald-400" />
                Resumo de Gestao
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-400">
                  {dataFormatada}
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  title="Fechar"
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Abas */}
            <div className="flex border-b border-white/10 bg-slate-900/50 px-4">
              <button
                type="button"
                onClick={() => setActiveTab("resumo")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === "resumo"
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                <Wallet className="w-4 h-4" />
                Contas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("fluxo")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === "fluxo"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Fluxo de Caixa
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("eventos")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === "eventos"
                    ? "border-orange-500 text-orange-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                Eventos & Chamados
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("despesas")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === "despesas"
                    ? "border-purple-500 text-purple-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                <PieChart className="w-4 h-4" />
                Despesas
              </button>
            </div>

            {/* Conteudo das Abas */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Aba Contas */}
              {activeTab === "resumo" && (
                <div className="space-y-6">
                  {/* Saldo em Conta */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-white/10">
                    <div className="flex items-center gap-3">
                      <PiggyBank className="w-6 h-6 text-emerald-400" />
                      <span className="text-slate-300 font-medium">SALDO EM CONTA</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(MOCK_DATA.saldoEmConta)}
                    </span>
                  </div>

                  {/* Contas Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* A Receber */}
                    <div className="rounded-xl overflow-hidden border border-emerald-500/30">
                      <div className="bg-emerald-500 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-white font-semibold">
                            <TrendingUp className="w-5 h-5" />
                            A Receber
                          </div>
                          <div className="grid grid-cols-2 gap-8 text-sm text-white/90">
                            <span>Qtde</span>
                            <span className="text-right">R$</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-emerald-500/10">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-500/20">
                          <span className="text-slate-300">VENCIDAS</span>
                          <div className="flex items-center gap-8">
                            <span className="text-slate-200 w-16 text-center">{String(MOCK_DATA.contasReceber.vencidas.qtd).padStart(2, '0')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-200">{formatCurrency(MOCK_DATA.contasReceber.vencidas.valor)}</span>
                              <button className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded">
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-500/20">
                          <span className="text-slate-300">A VENCER</span>
                          <div className="flex items-center gap-8">
                            <span className="text-slate-200 w-16 text-center">{String(MOCK_DATA.contasReceber.aVencer.qtd).padStart(2, '0')}</span>
                            <span className="text-slate-200 w-32 text-right">{formatCurrency(MOCK_DATA.contasReceber.aVencer.valor)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 bg-emerald-500/20">
                          <span className="text-emerald-300 font-semibold">TOTAL</span>
                          <span className="text-emerald-300 font-bold">{formatCurrency(totalReceber)}</span>
                        </div>
                      </div>
                    </div>

                    {/* A Pagar */}
                    <div className="rounded-xl overflow-hidden border border-red-500/30">
                      <div className="bg-red-400 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-white font-semibold">
                            <TrendingDown className="w-5 h-5" />
                            A Pagar
                          </div>
                          <div className="grid grid-cols-2 gap-8 text-sm text-white/90">
                            <span>Qtde</span>
                            <span className="text-right">R$</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-red-500/10">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-red-500/20">
                          <span className="text-slate-300">VENCIDAS</span>
                          <div className="flex items-center gap-8">
                            <span className="text-slate-200 w-16 text-center">{String(MOCK_DATA.contasPagar.vencidas.qtd).padStart(2, '0')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-200">{formatCurrency(MOCK_DATA.contasPagar.vencidas.valor)}</span>
                              <button className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 border-b border-red-500/20">
                          <span className="text-slate-300">AGENDADAS / CONCILIACAO PENDENTE</span>
                          <div className="flex items-center gap-8">
                            <span className="text-slate-200 w-16 text-center">{String(MOCK_DATA.contasPagar.agendadas.qtd).padStart(2, '0')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-200">{formatCurrency(MOCK_DATA.contasPagar.agendadas.valor)}</span>
                              <button className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 border-b border-red-500/20">
                          <span className="text-slate-300">A VENCER</span>
                          <div className="flex items-center gap-8">
                            <span className="text-slate-200 w-16 text-center">{String(MOCK_DATA.contasPagar.aVencer.qtd).padStart(2, '0')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-200">{formatCurrency(MOCK_DATA.contasPagar.aVencer.valor)}</span>
                              <button className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 bg-red-500/20">
                          <span className="text-red-300 font-semibold">TOTAL</span>
                          <span className="text-red-300 font-bold">{formatCurrency(totalPagar)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Fluxo de Caixa */}
              {activeTab === "fluxo" && (
                <div className="space-y-4">
                  {/* Filtros */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      Fluxo de Caixa Previsto/Realizado
                    </h3>
                    <div className="flex items-center gap-3">
                      <select
                        value={mesSelecionado}
                        onChange={(e) => setMesSelecionado(Number(e.target.value))}
                        title="Selecionar mes"
                        className="px-3 py-2 rounded-lg border border-white/10 bg-slate-800 text-slate-100 outline-none focus:border-blue-500"
                      >
                        {MESES.map((mes, i) => (
                          <option key={mes} value={i}>{mes}</option>
                        ))}
                      </select>
                      <select
                        value={anoSelecionado}
                        onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                        title="Selecionar ano"
                        className="px-3 py-2 rounded-lg border border-white/10 bg-slate-800 text-slate-100 outline-none focus:border-blue-500"
                      >
                        {[2024, 2025, 2026].map((ano) => (
                          <option key={ano} value={ano}>{ano}</option>
                        ))}
                      </select>
                      <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition">
                        OK
                      </button>
                    </div>
                  </div>

                  {/* Tabela Fluxo */}
                  <div className="rounded-xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-blue-600 text-white">
                            <th className="text-left py-3 px-4 font-semibold sticky left-0 bg-blue-600 z-10">
                              {MESES[mesSelecionado]}
                            </th>
                            {fluxoCaixa.map((f) => (
                              <th key={f.dia} className="py-3 px-3 font-medium text-center min-w-[90px]">
                                <div className="flex items-center justify-center gap-1">
                                  {f.dia}
                                  {f.realizado && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-slate-800/50">
                          {/* Saldo Inicial */}
                          <tr className="border-b border-white/5">
                            <td className="py-3 px-4 font-medium text-slate-300 sticky left-0 bg-slate-800 z-10">
                              Saldo Inicial
                            </td>
                            {fluxoCaixa.map((f) => (
                              <td key={f.dia} className={`py-3 px-3 text-center ${f.saldoInicial < 0 ? 'text-red-400' : 'text-slate-200'}`}>
                                {formatNumber(f.saldoInicial)}
                              </td>
                            ))}
                          </tr>
                          {/* Entrada */}
                          <tr className="border-b border-white/5">
                            <td className="py-3 px-4 font-medium text-slate-300 sticky left-0 bg-slate-800 z-10">
                              Entrada
                            </td>
                            {fluxoCaixa.map((f) => (
                              <td key={f.dia} className="py-3 px-3 text-center text-emerald-400">
                                {f.entrada > 0 ? formatNumber(f.entrada) : '-'}
                              </td>
                            ))}
                          </tr>
                          {/* Saida */}
                          <tr className="border-b border-white/5">
                            <td className="py-3 px-4 font-medium text-slate-300 sticky left-0 bg-slate-800 z-10">
                              Saida
                            </td>
                            {fluxoCaixa.map((f) => (
                              <td key={f.dia} className="py-3 px-3 text-center text-red-400">
                                {f.saida > 0 ? formatNumber(f.saida) : '-'}
                              </td>
                            ))}
                          </tr>
                          {/* Saldo Final */}
                          <tr className="bg-slate-700/50">
                            <td className="py-3 px-4 font-semibold text-slate-200 sticky left-0 bg-slate-700 z-10">
                              Saldo Final
                            </td>
                            {fluxoCaixa.map((f) => (
                              <td key={f.dia} className={`py-3 px-3 text-center font-semibold ${f.saldoFinal < 0 ? 'text-red-400' : 'text-slate-200'}`}>
                                {formatNumber(f.saldoFinal)}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Legenda */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-400">Ja realizado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span className="text-slate-400">O fluxo de caixa nao considera contas a receber vencidas fora do mes corrente</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Eventos & Chamados */}
              {activeTab === "eventos" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Eventos */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-orange-400" />
                      Eventos & Reservas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {MOCK_DATA.eventos.map((evento) => (
                        <div
                          key={evento.id}
                          className="p-4 rounded-xl bg-slate-800/50 border border-white/10 hover:border-orange-500/30 transition"
                        >
                          <div className="font-medium text-white mb-2">{evento.titulo}</div>
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-orange-500/20 border border-orange-500/30">
                              <span className="text-[10px] text-orange-300 font-medium">
                                {DIAS_SEMANA[evento.data.getDay()]}
                              </span>
                              <span className="text-xl font-bold text-white">
                                {evento.data.getDate()}
                              </span>
                              <span className="text-[10px] text-orange-300">
                                {MESES[evento.data.getMonth()].slice(0, 3)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm text-slate-300">
                                BLOCO {evento.bloco}, N° {evento.unidade}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {evento.diaInteiro ? "O dia inteiro" : `${evento.horaInicio} as ${evento.horaFim}`}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-3 text-center text-slate-400 hover:text-white border border-dashed border-white/20 hover:border-white/40 rounded-xl transition flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Ver Todos
                    </button>
                  </div>

                  {/* Chamados */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                      Chamados
                    </h3>
                    <div className="rounded-xl border border-white/10 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <span className="text-slate-300">TOTAL DO MES</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-white">{String(MOCK_DATA.chamados.totalMes).padStart(2, '0')}</span>
                          <button className="p-1 text-purple-400 hover:bg-purple-500/20 rounded">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3 bg-amber-500/10">
                        <span className="text-slate-300">EM ABERTO</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-amber-400">{String(MOCK_DATA.chamados.emAberto).padStart(2, '0')}</span>
                          <button className="p-1 text-purple-400 hover:bg-purple-500/20 rounded">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Despesas */}
              {activeTab === "despesas" && (
                <div className="space-y-6">
                  {/* Filtros de Grupo */}
                  <div className="flex flex-wrap gap-2">
                    {GRUPOS_DESPESAS.map((grupo) => (
                      <button
                        key={grupo.nome}
                        onClick={() => setGrupoDespesaSelecionado(grupo.nome)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
                          grupoDespesaSelecionado === grupo.nome
                            ? "bg-white/10 border-white/30 text-white"
                            : "border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                        }`}
                      >
                        {grupo.nome}
                      </button>
                    ))}
                  </div>

                  {/* Info */}
                  <div className="p-3 bg-slate-800/50 rounded-lg text-sm text-slate-400 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span>
                      Ambos os graficos apresentam as mesmas despesas. O primeiro apresenta a visao sintetica por Grupos de Despesas,
                      enquanto o segundo grafico traz a visao analitica aberto pela classificacao das despesas.
                    </span>
                  </div>

                  {/* Graficos */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Grafico Grupos */}
                    <div className="flex flex-col items-center">
                      <DonutChart data={dadosGruposDespesas} size={220} />
                      <div className="mt-6 w-full">
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">Grupos de Despesas</h4>
                        <div className="space-y-2">
                          {dadosGruposDespesas.map((item) => (
                            <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-sm text-slate-300">{item.label}</span>
                              </div>
                              <span className="text-sm font-medium text-slate-200">{formatNumber(item.value)}</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between py-2 bg-slate-700/30 rounded px-2">
                            <span className="text-sm font-semibold text-slate-200">TOTAL</span>
                            <span className="text-sm font-bold text-white">{formatNumber(totalDespesas)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Grafico Classificacao */}
                    <div className="flex flex-col items-center">
                      <DonutChart data={dadosClassificacaoDespesas} size={220} />
                      <div className="mt-6 w-full">
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">Classificacao das Despesas</h4>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                          {dadosClassificacaoDespesas.map((item) => (
                            <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-sm text-slate-300 truncate max-w-[200px]">{item.label}</span>
                              </div>
                              <span className="text-sm font-medium text-slate-200">{formatNumber(item.value)}</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between py-2 bg-slate-700/30 rounded px-2">
                            <span className="text-sm font-semibold text-slate-200">TOTAL</span>
                            <span className="text-sm font-bold text-white">{formatNumber(totalDespesas)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dica */}
                  <div className="p-3 bg-slate-800/50 rounded-lg text-sm text-slate-400 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    <span>
                      Para acessar as notas fiscais, boletos, recibos e comprovantes de pagamentos clique sobre o grupo de despesa.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
