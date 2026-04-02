"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  BarChart3,
  MapPin,
  Calendar,
  Tag,
  Activity,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type Chamado = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  categoria: string;
  status: "ABERTO" | "EM_ANALISE" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";
  prioridade: "BAIXA" | "MEDIA" | "ALTA" | "URGENTE" | "EMERGENCIA";
  localAfetado: string | null;
  solucao: string | null;
  custo: number | null;
  dataPrevisao: string | null;
  dataResolucao: string | null;
  observacoes: string | null;
  unit: { id: string; block: string; number: string } | null;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  titulo: string;
  tipo: string;
  categoria: string;
  prioridade: string;
  localAfetado: string;
  descricao: string;
  status: string;
  solucao: string;
  observacoes: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const initialFormData: FormData = {
  titulo: "",
  tipo: "MANUTENCAO_CORRETIVA",
  categoria: "OUTRO",
  prioridade: "MEDIA",
  localAfetado: "",
  descricao: "",
  status: "ABERTO",
  solucao: "",
  observacoes: "",
};

const TIPO_LABELS: Record<string, string> = {
  MANUTENCAO_PREVENTIVA: "Manutenção Preventiva",
  MANUTENCAO_CORRETIVA: "Manutenção Corretiva",
  SOLICITACAO_SERVICO: "Solicitação de Serviço",
  RECLAMACAO: "Reclamação",
  SUGESTAO: "Sugestão",
  EMERGENCIA: "Emergência",
};

const CATEGORIA_LABELS: Record<string, string> = {
  ELETRICA: "Elétrica",
  HIDRAULICA: "Hidráulica",
  ELEVADOR: "Elevador",
  AR_CONDICIONADO: "Ar Condicionado",
  PISCINA: "Piscina",
  JARDIM: "Jardim",
  LIMPEZA: "Limpeza",
  SEGURANCA: "Segurança",
  ESTRUTURAL: "Estrutural",
  OUTRO: "Outro",
};

const PRIORIDADE_LABELS: Record<string, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  URGENTE: "Urgente",
  EMERGENCIA: "Emergência",
};

const STATUS_LABELS: Record<string, string> = {
  ABERTO: "Aberto",
  EM_ANALISE: "Em Análise",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

// ─── Badge helpers ─────────────────────────────────────────────────────────────

function getStatusBadge(status: string): string {
  const map: Record<string, string> = {
    ABERTO:
      "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    EM_ANALISE:
      "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    EM_ANDAMENTO:
      "bg-orange-500/20 text-orange-300 border border-orange-500/30",
    CONCLUIDO:
      "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    CANCELADO:
      "bg-slate-500/20 text-slate-400 border border-slate-500/30",
  };
  return map[status] ?? "bg-slate-500/20 text-slate-400 border border-slate-500/30";
}

function getPrioridadeBadge(prioridade: string): string {
  const map: Record<string, string> = {
    BAIXA: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
    MEDIA: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    ALTA: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    URGENTE: "bg-red-500/20 text-red-300 border border-red-500/30",
    EMERGENCIA:
      "bg-red-600/30 text-red-200 border border-red-500/40 animate-pulse",
  };
  return map[prioridade] ?? "bg-slate-500/20 text-slate-300 border border-slate-500/30";
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("pt-BR");
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm transition-all";

const selectCls =
  "w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm transition-all";

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ChamadosPage() {
  const { push } = useToast();

  // Data
  const [list, setList] = useState<Chamado[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Filters
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterPrioridade, setFilterPrioridade] = useState("");

  // Bulk select
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Drawer (create / edit)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingChamado, setEditingChamado] = useState<Chamado | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState<Chamado | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  // ─── Query string ────────────────────────────────────────────────────────────

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filterSearch.trim()) params.set("search", filterSearch.trim());
    if (filterStatus.trim()) params.set("status", filterStatus.trim());
    if (filterCategoria.trim()) params.set("categoria", filterCategoria.trim());
    if (filterPrioridade.trim()) params.set("prioridade", filterPrioridade.trim());
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [filterSearch, filterStatus, filterCategoria, filterPrioridade, page, pageSize]);

  // ─── Load ────────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets?${queryString}`, { cache: "no-store" });
      const data = await res.json();
      if (data?.ok) {
        setList(data.data ?? []);
        setTotal(data.total ?? 0);
      } else {
        push({ title: "Erro", message: data?.message || "Falha ao carregar chamados", kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao carregar chamados:", err);
      push({ title: "Erro", message: "Falha de conexão ao carregar chamados", kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [queryString, push]);

  useEffect(() => {
    load();
  }, [load]);

  // ─── KPI stats ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    total: list.length,
    aberto: list.filter((c) => c.status === "ABERTO").length,
    emAnalise: list.filter((c) => c.status === "EM_ANALISE").length,
    emAndamento: list.filter((c) => c.status === "EM_ANDAMENTO").length,
    concluido: list.filter((c) => c.status === "CONCLUIDO").length,
    cancelado: list.filter((c) => c.status === "CANCELADO").length,
  }), [list]);

  // ─── Drawer helpers ──────────────────────────────────────────────────────────

  function openNew() {
    setEditingChamado(null);
    setFormData(initialFormData);
    setFormError("");
    setIsDrawerOpen(true);
  }

  function openEdit(chamado: Chamado) {
    setEditingChamado(chamado);
    setFormData({
      titulo: chamado.titulo,
      tipo: chamado.tipo,
      categoria: chamado.categoria,
      prioridade: chamado.prioridade,
      localAfetado: chamado.localAfetado ?? "",
      descricao: chamado.descricao,
      status: chamado.status,
      solucao: chamado.solucao ?? "",
      observacoes: chamado.observacoes ?? "",
    });
    setFormError("");
    setIsDrawerOpen(true);
  }

  function closeDrawer() {
    setIsDrawerOpen(false);
    setEditingChamado(null);
    setFormData(initialFormData);
    setFormError("");
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!formData.titulo.trim()) { setFormError("Título é obrigatório"); return; }
    if (!formData.descricao.trim()) { setFormError("Descrição é obrigatória"); return; }
    if (!formData.tipo) { setFormError("Tipo é obrigatório"); return; }
    if (!formData.categoria) { setFormError("Categoria é obrigatória"); return; }
    if (!formData.prioridade) { setFormError("Prioridade é obrigatória"); return; }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        titulo: formData.titulo.trim(),
        tipo: formData.tipo,
        categoria: formData.categoria,
        prioridade: formData.prioridade,
        descricao: formData.descricao.trim(),
        localAfetado: formData.localAfetado.trim() || null,
        observacoes: formData.observacoes.trim() || null,
      };

      if (editingChamado) {
        body.status = formData.status;
        body.solucao = formData.solucao.trim() || null;
      }

      const url = editingChamado ? `/api/tickets/${editingChamado.id}` : "/api/tickets";
      const method = editingChamado ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.ok) {
        push({
          title: editingChamado ? "Chamado atualizado" : "Chamado criado",
          message: `Chamado ${editingChamado ? "atualizado" : "criado"} com sucesso`,
          kind: "success",
        });
        closeDrawer();
        load();
      } else {
        setFormError(data.message || "Erro ao salvar chamado");
        push({ title: "Erro", message: data.message || "Erro ao salvar chamado", kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao salvar chamado:", err);
      setFormError("Erro de conexão ao salvar chamado");
      push({ title: "Erro", message: "Falha de conexão", kind: "error" });
    } finally {
      setSaving(false);
    }
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/tickets/${deleteConfirm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        push({ title: "Chamado excluído", message: "Chamado excluído com sucesso", kind: "success" });
        setSelected((prev) => { const s = new Set(prev); s.delete(deleteConfirm.id); return s; });
        load();
      } else {
        push({ title: "Erro", message: data.message || "Erro ao excluir chamado", kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao excluir chamado:", err);
      push({ title: "Erro", message: "Falha ao excluir chamado", kind: "error" });
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  }

  // ─── Filters ─────────────────────────────────────────────────────────────────

  function clearFilters() {
    setFilterSearch("");
    setFilterStatus("");
    setFilterCategoria("");
    setFilterPrioridade("");
    setPage(1);
  }

  const hasFilters = !!(filterSearch || filterStatus || filterCategoria || filterPrioridade);

  // ─── Bulk select ─────────────────────────────────────────────────────────────

  const allSelected = list.length > 0 && list.every((c) => selected.has(c.id));
  const someSelected = list.some((c) => selected.has(c.id));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(list.map((c) => c.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  // ─── KPI card config ─────────────────────────────────────────────────────────

  const kpiCards = [
    {
      label: "Total",
      value: stats.total,
      icon: BarChart3,
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-500/10",
      topBorder: "border-t-2 border-cyan-500",
    },
    {
      label: "Abertos",
      value: stats.aberto,
      icon: Clock,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/10",
      topBorder: "border-t-2 border-blue-500",
    },
    {
      label: "Em Análise",
      value: stats.emAnalise,
      icon: Activity,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10",
      topBorder: "border-t-2 border-amber-500",
    },
    {
      label: "Em Andamento",
      value: stats.emAndamento,
      icon: TrendingUp,
      iconColor: "text-orange-400",
      iconBg: "bg-orange-500/10",
      topBorder: "border-t-2 border-orange-500",
    },
    {
      label: "Concluídos",
      value: stats.concluido,
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      topBorder: "border-t-2 border-emerald-500",
    },
    {
      label: "Cancelados",
      value: stats.cancelado,
      icon: Zap,
      iconColor: "text-slate-400",
      iconBg: "bg-slate-500/10",
      topBorder: "border-t-2 border-slate-500",
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Chamados</h1>
            <p className="text-sm text-slate-400">
              Gerencie solicitações de manutenção e serviços do condomínio
            </p>
          </div>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/25 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Chamado
        </button>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 ${card.topBorder} flex flex-col gap-3`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-400">{card.label}</p>
                <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-100">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={filterSearch}
              onChange={(e) => { setFilterSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm transition-all"
            />
          </div>

          <Filter className="w-4 h-4 text-slate-500 shrink-0" />

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm transition-all"
          >
            <option value="">Todos os Status</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>

          {/* Categoria */}
          <select
            value={filterCategoria}
            onChange={(e) => { setFilterCategoria(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm transition-all"
          >
            <option value="">Todas as Categorias</option>
            {Object.entries(CATEGORIA_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>

          {/* Prioridade */}
          <select
            value={filterPrioridade}
            onChange={(e) => { setFilterPrioridade(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-sm transition-all"
          >
            <option value="">Todas as Prioridades</option>
            {Object.entries(PRIORIDADE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        {/* Bulk-select action bar */}
        {someSelected && (
          <div className="px-6 py-3 bg-cyan-500/10 border-b border-cyan-500/20 flex items-center justify-between">
            <span className="text-sm text-cyan-300 font-medium">
              {selected.size} chamado{selected.size > 1 ? "s" : ""} selecionado{selected.size > 1 ? "s" : ""}
            </span>
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Limpar seleção
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800">
                {/* Checkbox header */}
                <th className="pl-4 pr-2 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 cursor-pointer accent-cyan-500"
                  />
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Chamado
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Prioridade
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider pr-6">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                      <span className="text-slate-400 text-sm">Carregando chamados...</span>
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                        <Wrench className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-slate-300 font-medium">Nenhum chamado encontrado</p>
                      <p className="text-slate-500 text-sm">
                        {hasFilters
                          ? "Tente ajustar os filtros de busca"
                          : "Abra o primeiro chamado do condomínio"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                list.map((chamado) => (
                  <tr
                    key={chamado.id}
                    className={`
                      hover:bg-slate-800/50 border-b border-slate-800 transition-colors
                      ${chamado.prioridade === "EMERGENCIA" ? "border-l-2 border-l-red-500/70" : ""}
                      ${selected.has(chamado.id) ? "bg-cyan-500/5" : ""}
                    `}
                  >
                    {/* Checkbox */}
                    <td className="pl-4 pr-2 py-4 w-10">
                      <input
                        type="checkbox"
                        checked={selected.has(chamado.id)}
                        onChange={() => toggleOne(chamado.id)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 cursor-pointer accent-cyan-500"
                      />
                    </td>

                    {/* Título */}
                    <td className="px-4 py-4 max-w-xs">
                      <p className="font-semibold text-slate-100 text-sm leading-tight">
                        {chamado.titulo}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 mt-1">
                        {chamado.localAfetado && (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="w-3 h-3" />
                            {chamado.localAfetado}
                          </span>
                        )}
                        {chamado.unit && (
                          <span className="text-xs text-slate-500">
                            Bloco {chamado.unit.block} – Apto {chamado.unit.number}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {TIPO_LABELS[chamado.tipo] ?? chamado.tipo}
                      </p>
                    </td>

                    {/* Categoria */}
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/15 text-orange-300 border border-orange-500/25">
                        <Tag className="w-3 h-3" />
                        {CATEGORIA_LABELS[chamado.categoria] ?? chamado.categoria}
                      </span>
                    </td>

                    {/* Prioridade */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrioridadeBadge(chamado.prioridade)}`}
                      >
                        {PRIORIDADE_LABELS[chamado.prioridade] ?? chamado.prioridade}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(chamado.status)}`}
                      >
                        {STATUS_LABELS[chamado.status] ?? chamado.status}
                      </span>
                    </td>

                    {/* Data */}
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {formatDate(chamado.createdAt)}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-4 pr-6 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEdit(chamado)}
                          title="Editar"
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors group"
                        >
                          <Edit2 className="w-4 h-4 text-slate-500 group-hover:text-slate-200 transition-colors" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(chamado)}
                          title="Excluir"
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                        >
                          <Trash2 className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {(totalPages > 1 || total > 0) && (
          <div className="border-t border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Mostrando{" "}
              <span className="text-slate-300 font-medium">{list.length}</span> de{" "}
              <span className="text-slate-300 font-medium">{total}</span> chamado{total !== 1 ? "s" : ""}
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span key={`ellipsis-${idx}`} className="w-9 text-center text-slate-500 text-sm">
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item as number)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                          page === item
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25"
                            : "bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Right-side drawer (create / edit) ──────────────────────────────── */}
      {/* Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-lg bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col transition-transform duration-300 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Gradient top line */}
        <div className="h-0.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 shrink-0" />

        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {editingChamado ? "Editar Chamado" : "Novo Chamado"}
              </h2>
              <p className="text-xs text-slate-500">
                {editingChamado ? "Atualize os dados do chamado" : "Preencha as informações abaixo"}
              </p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Drawer form */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-5" id="chamado-form">

            {/* Error banner */}
            {formError && (
              <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                {formError}
              </div>
            )}

            {/* Section: Identificação */}
            <p className="text-cyan-400 text-xs uppercase tracking-wider font-semibold">
              Identificação
            </p>

            <Field label="Título" required>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                placeholder="Ex: Vazamento na garagem"
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Tipo" required>
                <select name="tipo" value={formData.tipo} onChange={handleInputChange} className={selectCls}>
                  {Object.entries(TIPO_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </Field>

              <Field label="Categoria" required>
                <select name="categoria" value={formData.categoria} onChange={handleInputChange} className={selectCls}>
                  {Object.entries(CATEGORIA_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Prioridade" required>
                <select name="prioridade" value={formData.prioridade} onChange={handleInputChange} className={selectCls}>
                  {Object.entries(PRIORIDADE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </Field>

              <Field label="Local Afetado">
                <input
                  type="text"
                  name="localAfetado"
                  value={formData.localAfetado}
                  onChange={handleInputChange}
                  placeholder="Ex: Garagem B"
                  className={inputCls}
                />
              </Field>
            </div>

            {/* Section: Detalhes */}
            <p className="text-cyan-400 text-xs uppercase tracking-wider font-semibold pt-1">
              Detalhes
            </p>

            <Field label="Descrição" required>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                rows={3}
                placeholder="Descreva detalhadamente o problema ou solicitação..."
                className={`${inputCls} resize-none`}
              />
            </Field>

            <Field label="Observações">
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                rows={2}
                placeholder="Informações adicionais relevantes..."
                className={`${inputCls} resize-none`}
              />
            </Field>

            {/* Section: Resolução — edit only */}
            {editingChamado && (
              <>
                <p className="text-cyan-400 text-xs uppercase tracking-wider font-semibold pt-1">
                  Resolução
                </p>

                <Field label="Status">
                  <select name="status" value={formData.status} onChange={handleInputChange} className={selectCls}>
                    {Object.entries(STATUS_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Solução">
                  <textarea
                    name="solucao"
                    value={formData.solucao}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Descreva como o problema foi resolvido..."
                    className={`${inputCls} resize-none`}
                  />
                </Field>
              </>
            )}
          </form>
        </div>

        {/* Drawer footer */}
        <div className="shrink-0 px-6 py-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-900">
          <button
            type="button"
            onClick={closeDrawer}
            className="px-4 py-2.5 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-all font-medium text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="chamado-form"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Salvando..." : editingChamado ? "Atualizar Chamado" : "Criar Chamado"}
          </button>
        </div>
      </div>

      {/* ── Delete confirmation modal ───────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md">
            {/* Red accent line */}
            <div className="h-0.5 bg-gradient-to-r from-red-600 to-red-400 rounded-t-2xl" />

            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Excluir Chamado?</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Esta ação não pode ser desfeita.</p>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 mb-5">
                <p className="text-sm text-slate-300">
                  Chamado:{" "}
                  <span className="font-semibold text-slate-100">{deleteConfirm.titulo}</span>
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(deleteConfirm.status)}`}>
                    {STATUS_LABELS[deleteConfirm.status]}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPrioridadeBadge(deleteConfirm.prioridade)}`}>
                    {PRIORIDADE_LABELS[deleteConfirm.prioridade]}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="px-4 py-2.5 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 transition-all font-medium text-sm disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {deleting ? "Excluindo..." : "Excluir Chamado"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
