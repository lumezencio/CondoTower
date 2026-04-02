"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { TrendingUp, Plus, Search, Edit2, Trash2, X, ChevronLeft, ChevronRight, Loader2, Calendar, DollarSign, Building2, CheckCircle, Clock, AlertTriangle, Banknote } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type Revenue = {
  id: string;
  description: string;
  type: string;
  amount: number;
  dueDate: string;
  receiptDate: string | null;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  paymentMethod: string | null;
  receiptUrl: string | null;
  notes: string | null;
  unitId: string | null;
  unit: { block: string; number: string } | null;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  description: string;
  type: string;
  amount: string;
  dueDate: string;
  unitId: string;
  paymentMethod: string;
  receiptUrl: string;
  notes: string;
};

const initialFormData: FormData = {
  description: "",
  type: "TAXA_COND",
  amount: "",
  dueDate: "",
  unitId: "",
  paymentMethod: "",
  receiptUrl: "",
  notes: "",
};

const REVENUE_TYPE_LABELS: Record<string, string> = {
  TAXA_COND: "Taxa de Condominio",
  TAXA_EXTRA: "Taxa Extra",
  MULTA: "Multa",
  JUROS: "Juros",
  RESERVA: "Reserva",
  ALUGUEL_AREA_COMUM: "Aluguel de Area Comum",
  OUTRO: "Outro",
};

export default function ContasReceberPage() {
  const { push } = useToast();
  const [list, setList] = useState<Revenue[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [units, setUnits] = useState<any[]>([]);

  // Filtros
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Revenue | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Carregar unidades
  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const res = await fetch('/api/units?pageSize=500');
      const data = await res.json();
      if (data.ok) setUnits(data.data || []);
    } catch (err) {
      console.error('Erro ao carregar unidades:', err);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filterStatus.trim()) params.set("status", filterStatus.trim());
    if (filterType.trim()) params.set("type", filterType.trim());
    if (filterSearch.trim()) params.set("search", filterSearch.trim());
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [filterStatus, filterType, filterSearch, page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/revenues?${queryString}`, { cache: "no-store" });
      const data = await response.json();
      if (data?.ok) {
        setList(data.data ?? []);
        setTotal(data.total ?? 0);
      } else {
        push({ title: "Erro", message: data?.message || "Falha ao carregar receitas", kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao carregar receitas:", err);
      push({ title: "Erro", message: "Falha de conexao ao carregar receitas", kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [queryString, push]);

  useEffect(() => {
    load();
  }, [load]);

  function openNewModal() {
    setIsModalOpen(true);
    setEditingRevenue(null);
    setFormData(initialFormData);
    setError("");
  }

  function openEditModal(revenue: Revenue) {
    setIsModalOpen(true);
    setEditingRevenue(revenue);
    setFormData({
      description: revenue.description,
      type: revenue.type,
      amount: String(revenue.amount),
      dueDate: revenue.dueDate.split("T")[0],
      unitId: revenue.unit?.id ?? "",
      paymentMethod: revenue.paymentMethod ?? "",
      receiptUrl: revenue.receiptUrl ?? "",
      notes: revenue.notes ?? "",
    });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!formData.description.trim()) {
      setError("Descricao e obrigatoria");
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Valor deve ser maior que zero");
      return;
    }
    if (!formData.dueDate) {
      setError("Data de vencimento e obrigatoria");
      return;
    }

    setSaving(true);
    try {
      const body = {
        ...formData,
        amount: Number(formData.amount),
        tenant: "parkclub",
      };

      const url = editingRevenue ? `/api/revenues/${editingRevenue.id}` : "/api/revenues";
      const method = editingRevenue ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.ok) {
        push({
          title: editingRevenue ? "Receita atualizada" : "Receita criada",
          message: `Receita ${editingRevenue ? "atualizada" : "criada"} com sucesso`,
          kind: "success",
        });
        setIsModalOpen(false);
        load();
      } else {
        setError(data.message || "Erro ao salvar receita");
        push({ title: "Erro", message: data.message, kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao salvar receita:", err);
      setError("Erro de conexao ao salvar receita");
      push({ title: "Erro", message: "Falha de conexao", kind: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/revenues/${deleteConfirm.id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.ok) {
        push({ title: "Receita excluida", message: "Receita excluida com sucesso", kind: "success" });
        load();
      } else {
        push({ title: "Erro", message: data.message, kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao excluir receita:", err);
      push({ title: "Erro", message: "Falha ao excluir receita", kind: "error" });
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  }

  async function handleMarkAsPaid(revenue: Revenue) {
    try {
      const response = await fetch(`/api/revenues/${revenue.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });
      const data = await response.json();
      if (data.ok) {
        push({ title: "Receita recebida", message: "Status atualizado para recebido", kind: "success" });
        load();
      } else {
        push({ title: "Erro", message: data.message, kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao marcar como recebida:", err);
      push({ title: "Erro", message: "Falha ao atualizar status", kind: "error" });
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  }

  function formatDate(dateString: string) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      PENDING: "Pendente",
      PAID: "Recebido",
      OVERDUE: "Atrasado",
      CANCELLED: "Cancelado",
    };
    return labels[status] || status;
  }

  function getStatusClass(status: string) {
    const classes: Record<string, string> = {
      PENDING: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
      PAID: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
      OVERDUE: "bg-red-500/20 text-red-300 border border-red-500/30",
      CANCELLED: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
    };
    return classes[status] || classes.PENDING;
  }

  // KPI computations
  const pendentesCount = list.filter((r) => r.status === "PENDING").length;
  const recebidosCount = list.filter((r) => r.status === "PAID").length;
  const atrasadosCount = list.filter((r) => r.status === "OVERDUE").length;
  const totalAmount = list.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Contas a Receber</h1>
            <p className="text-sm text-slate-400">Gerencie as receitas do condominio</p>
          </div>
        </div>
        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nova Receita
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 border-t-2 border-t-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total</p>
              <p className="text-xl font-bold text-slate-100">{total}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 border-t-2 border-t-amber-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Pendentes</p>
              <p className="text-xl font-bold text-amber-300">{pendentesCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 border-t-2 border-t-emerald-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Recebidos</p>
              <p className="text-xl font-bold text-emerald-300">{recebidosCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 border-t-2 border-t-red-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Atrasados</p>
              <p className="text-xl font-bold text-red-300">{atrasadosCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 border-t-2 border-t-teal-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Valor Total</p>
              <p className="text-lg font-bold text-teal-300">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar receita..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none text-sm placeholder:text-slate-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none text-sm"
          >
            <option value="">Todos Status</option>
            <option value="PENDING">Pendentes</option>
            <option value="PAID">Recebidos</option>
            <option value="OVERDUE">Atrasados</option>
            <option value="CANCELLED">Cancelados</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none text-sm"
          >
            <option value="">Todos Tipos</option>
            {Object.entries(REVENUE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Descricao</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Vencimento</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                      <span className="text-slate-400">Carregando receitas...</span>
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-slate-400 font-medium">Nenhuma receita encontrada</p>
                      <p className="text-slate-500 text-sm">Cadastre a primeira receita do condominio</p>
                    </div>
                  </td>
                </tr>
              ) : (
                list.map((revenue) => (
                  <tr
                    key={revenue.id}
                    className={`hover:bg-slate-800/40 border-b border-slate-800 transition-colors ${
                      revenue.status === "OVERDUE" ? "border-l-2 border-l-red-500/70" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-200">{revenue.description}</p>
                        {revenue.unit && (
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {revenue.unit.block} - {revenue.unit.number}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50">
                        {REVENUE_TYPE_LABELS[revenue.type] || revenue.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {formatDate(revenue.dueDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-emerald-300 font-semibold">{formatCurrency(revenue.amount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(revenue.status)}`}>
                        {getStatusLabel(revenue.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {revenue.status === "PENDING" && (
                          <button
                            onClick={() => handleMarkAsPaid(revenue)}
                            className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors group"
                            title="Marcar como recebida"
                          >
                            <CheckCircle className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(revenue)}
                          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(revenue)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-slate-800 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Mostrando <span className="font-medium text-slate-300">{list.length}</span> de <span className="font-medium text-slate-300">{total}</span> receitas
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-slate-400 px-2">
                Pagina {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-400"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right-side Drawer */}
      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-lg bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col">
            <div className="h-0.5 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500" />
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-slate-100">
                {editingRevenue ? "Editar Receita" : "Nova Receita"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Informacoes Basicas */}
              <div>
                <p className="text-cyan-400 text-xs uppercase tracking-wider font-semibold mb-3">Informacoes Basicas</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Descricao *</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none placeholder:text-slate-500"
                      placeholder="Ex: Taxa de condominio - Apto 101"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Unidade (Opcional)</label>
                      <select
                        value={formData.unitId}
                        onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="">Selecione uma unidade...</option>
                        {units.map((unit: any) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.block} - {unit.number}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Tipo *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                      >
                        {Object.entries(REVENUE_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Valores e Datas */}
              <div>
                <p className="text-cyan-400 text-xs uppercase tracking-wider font-semibold mb-3">Valores e Datas</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Valor *</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="number"
                          step="0.01"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none placeholder:text-slate-500"
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Data de Vencimento *</label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Observacoes */}
              <div>
                <p className="text-cyan-400 text-xs uppercase tracking-wider font-semibold mb-3">Observacoes</p>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none resize-none placeholder:text-slate-500"
                  placeholder="Informacoes adicionais..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Salvando..." : (editingRevenue ? "Atualizar" : "Criar Receita")}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Excluir Receita?</h3>
                <p className="text-sm text-slate-400">Esta acao nao pode ser desfeita.</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 mb-6">
              Tem certeza que deseja excluir a receita <strong className="text-slate-200">{deleteConfirm.description}</strong>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
