"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FileText, Plus, Search, Edit2, Trash2, X, ChevronLeft, ChevronRight, Loader2, Calendar, DollarSign, Building2, Receipt, AlertTriangle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type TaxWithholding = {
  id: string;
  revenueId: string;
  taxType: string;
  baseAmount: number;
  taxRate: number;
  taxAmount: number;
  dueDate: string;
  paymentDate: string | null;
  status: "PENDING" | "PAID" | "CANCELLED";
  guideUrl: string | null;
  notes: string | null;
  revenue?: {
    description: string;
    type: string;
    amount: number;
    unit?: { block: string; number: string };
  };
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  revenueId: string;
  taxType: string;
  baseAmount: string;
  taxRate: string;
  dueDate: string;
  guideUrl: string;
  notes: string;
};

const initialFormData: FormData = {
  revenueId: "",
  taxType: "ISS",
  baseAmount: "",
  taxRate: "0.05",
  dueDate: "",
  guideUrl: "",
  notes: "",
};

const TAX_TYPE_LABELS: Record<string, string> = {
  COFINS: "COFINS",
  CSLL: "CSLL",
  IRPJ: "IRPJ",
  PIS: "PIS",
  ISS: "ISS",
  OUTRO: "Outro",
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

export default function ImpostosRetidosPage() {
  const { push } = useToast();
  const [list, setList] = useState<TaxWithholding[]>([]);
  const [revenues, setRevenues] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Filtros
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTaxType, setFilterTaxType] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxWithholding | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<TaxWithholding | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filterStatus.trim()) params.set("status", filterStatus.trim());
    if (filterTaxType.trim()) params.set("taxType", filterTaxType.trim());
    if (filterSearch.trim()) params.set("search", filterSearch.trim());
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [filterStatus, filterTaxType, filterSearch, page, pageSize]);

  const loadRevenues = useCallback(async () => {
    try {
      const response = await fetch("/api/revenues?pageSize=100&status=PAID", { cache: "no-store" });
      const data = await response.json();
      if (data?.ok) {
        setRevenues(data.data ?? []);
      }
    } catch (err) {
      console.error("Erro ao carregar receitas:", err);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/taxes?${queryString}`, { cache: "no-store" });
      const data = await response.json();
      if (data?.ok) {
        setList(data.data ?? []);
        setTotal(data.total ?? 0);
      } else {
        push({ title: "Erro", message: data?.message || "Falha ao carregar impostos", kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao carregar impostos:", err);
      push({ title: "Erro", message: "Falha de conexao ao carregar impostos", kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [queryString, push]);

  useEffect(() => {
    load();
    loadRevenues();
  }, [load, loadRevenues]);

  // KPI computations from current page data
  const kpis = useMemo(() => {
    const totalCount = list.length;
    const pendingCount = list.filter((t) => t.status === "PENDING").length;
    const paidCount = list.filter((t) => t.status === "PAID").length;
    const totalTaxAmount = list.reduce((sum, t) => sum + t.taxAmount, 0);
    return { totalCount, pendingCount, paidCount, totalTaxAmount };
  }, [list]);

  function openNewModal() {
    setIsModalOpen(true);
    setEditingTax(null);
    setFormData(initialFormData);
    setError("");
  }

  function openEditModal(tax: TaxWithholding) {
    setIsModalOpen(true);
    setEditingTax(tax);
    setFormData({
      revenueId: tax.revenueId,
      taxType: tax.taxType,
      baseAmount: String(tax.baseAmount),
      taxRate: String(tax.taxRate),
      dueDate: tax.dueDate.split("T")[0],
      guideUrl: tax.guideUrl ?? "",
      notes: tax.notes ?? "",
    });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!formData.revenueId) {
      setError("Receita e obrigatoria");
      return;
    }
    if (!formData.baseAmount || Number(formData.baseAmount) <= 0) {
      setError("Valor base deve ser maior que zero");
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
        baseAmount: Number(formData.baseAmount),
        taxRate: Number(formData.taxRate),
        taxAmount: Number(formData.baseAmount) * Number(formData.taxRate),
        tenant: "parkclub",
      };

      const url = editingTax ? `/api/taxes/${editingTax.id}` : "/api/taxes";
      const method = editingTax ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.ok) {
        push({
          title: editingTax ? "Imposto atualizado" : "Imposto criado",
          message: `Imposto retido ${editingTax ? "atualizado" : "criado"} com sucesso`,
          kind: "success",
        });
        setIsModalOpen(false);
        load();
      } else {
        setError(data.message || "Erro ao salvar imposto");
        push({ title: "Erro", message: data.message, kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao salvar imposto:", err);
      setError("Erro de conexao ao salvar imposto");
      push({ title: "Erro", message: "Falha de conexao", kind: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/taxes/${deleteConfirm.id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.ok) {
        push({ title: "Imposto excluido", message: "Imposto excluido com sucesso", kind: "success" });
        load();
      } else {
        push({ title: "Erro", message: data.message, kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao excluir imposto:", err);
      push({ title: "Erro", message: "Falha ao excluir imposto", kind: "error" });
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
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
      PAID: "Pago",
      CANCELLED: "Cancelado",
    };
    return labels[status] || status;
  }

  function getStatusClass(status: string) {
    const classes: Record<string, string> = {
      PENDING: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
      PAID: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
      CANCELLED: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
    };
    return classes[status] || classes.PENDING;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <FileText className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Impostos Retidos</h1>
            <p className="text-sm text-slate-400">Gerencie os impostos retidos nas receitas</p>
          </div>
        </div>
        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          Lancar Imposto
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 border-t-2 border-t-cyan-500 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Total</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100">{kpis.totalCount}</p>
          <p className="text-xs text-slate-500 mt-1">impostos nesta pagina</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 border-t-2 border-t-amber-500 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Pendentes</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-300">{kpis.pendingCount}</p>
          <p className="text-xs text-slate-500 mt-1">aguardando pagamento</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 border-t-2 border-t-emerald-500 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Pagos</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-300">{kpis.paidCount}</p>
          <p className="text-xs text-slate-500 mt-1">impostos quitados</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 border-t-2 border-t-purple-500 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Valor Total Retido</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-300">{formatCurrency(kpis.totalTaxAmount)}</p>
          <p className="text-xs text-slate-500 mt-1">soma dos impostos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar imposto..."
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
            <option value="PAID">Pagos</option>
            <option value="CANCELLED">Cancelados</option>
          </select>
          <select
            value={filterTaxType}
            onChange={(e) => setFilterTaxType(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none text-sm"
          >
            <option value="">Todos Tipos</option>
            {Object.entries(TAX_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista / Tabela */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Receita</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Base</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Aliquota</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Vencimento</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                      <span className="text-slate-400">Carregando impostos...</span>
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-slate-400 font-medium">Nenhum imposto retido encontrado</p>
                      <p className="text-slate-500 text-sm">Lance o primeiro imposto retido</p>
                    </div>
                  </td>
                </tr>
              ) : (
                list.map((tax) => (
                  <tr key={tax.id} className="hover:bg-slate-800/40 border-b border-slate-800 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-200">{tax.revenue?.description || "-"}</p>
                        {tax.revenue?.unit && (
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {tax.revenue.unit.block} - {tax.revenue.unit.number}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-0.5">
                          {REVENUE_TYPE_LABELS[tax.revenue?.type ?? ""] || tax.revenue?.type}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {TAX_TYPE_LABELS[tax.taxType] || tax.taxType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-200">{formatCurrency(tax.baseAmount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-400">{(tax.taxRate * 100).toFixed(2)}%</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-amber-300 font-semibold">{formatCurrency(tax.taxAmount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {formatDate(tax.dueDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(tax.status)}`}>
                        {getStatusLabel(tax.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(tax)}
                          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(tax)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
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

        {/* Paginacao */}
        {totalPages > 1 && (
          <div className="border-t border-slate-800 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Mostrando <span className="font-medium text-slate-300">{list.length}</span> de <span className="font-medium text-slate-300">{total}</span> impostos
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

      {/* Drawer Novo/Editar (right-side) */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-lg bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col">
            {/* Gradient top line */}
            <div className="h-0.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />

            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-slate-100">
                {editingTax ? "Editar Imposto" : "Lancar Imposto Retido"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Drawer body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Receita section */}
              <div>
                <label className="text-cyan-400 text-xs uppercase tracking-wider font-semibold mb-2 block">Receita *</label>
                <select
                  value={formData.revenueId}
                  onChange={(e) => setFormData({ ...formData, revenueId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">Selecione uma receita...</option>
                  {revenues.map((rev: any) => (
                    <option key={rev.id} value={rev.id}>
                      {rev.description} - {formatCurrency(rev.amount)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo e Aliquota */}
              <div>
                <label className="text-cyan-400 text-xs uppercase tracking-wider font-semibold mb-2 block">Tipo e Aliquota</label>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={formData.taxType}
                    onChange={(e) => setFormData({ ...formData, taxType: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                  >
                    {Object.entries(TAX_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>

                  <select
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="0.03">3% - COFINS</option>
                    <option value="0.05">5% - ISS</option>
                    <option value="0.065">6.5% - PIS/COFINS</option>
                    <option value="0.10">10% - IRRF</option>
                    <option value="0.15">15% - IRRF</option>
                    <option value="0.20">20% - IRRF</option>
                  </select>
                </div>
              </div>

              {/* Valores */}
              <div>
                <label className="text-cyan-400 text-xs uppercase tracking-wider font-semibold mb-2 block">Valores</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Valor Base *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="number"
                        step="0.01"
                        value={formData.baseAmount}
                        onChange={(e) => setFormData({ ...formData, baseAmount: e.target.value })}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none placeholder:text-slate-600"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Valor do Imposto</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="number"
                        step="0.01"
                        value={String((Number(formData.baseAmount) || 0) * (Number(formData.taxRate) || 0))}
                        disabled
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 text-amber-300 font-mono rounded-xl outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vencimento */}
              <div>
                <label className="text-cyan-400 text-xs uppercase tracking-wider font-semibold mb-2 block">Data de Vencimento *</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* URL da Guia */}
              <div>
                <label className="text-cyan-400 text-xs uppercase tracking-wider font-semibold mb-2 block">URL da Guia</label>
                <input
                  type="url"
                  value={formData.guideUrl}
                  onChange={(e) => setFormData({ ...formData, guideUrl: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none placeholder:text-slate-600"
                  placeholder="https://..."
                />
              </div>

              {/* Observacoes */}
              <div>
                <label className="text-cyan-400 text-xs uppercase tracking-wider font-semibold mb-2 block">Observacoes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none resize-none placeholder:text-slate-600"
                  placeholder="Informacoes adicionais..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Salvando..." : (editingTax ? "Atualizar" : "Lancar Imposto")}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Modal Confirmar Exclusao */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Red gradient top line */}
            <div className="h-0.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />

            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Excluir Imposto?</h3>
                  <p className="text-sm text-slate-400">Esta acao nao pode ser desfeita.</p>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-6">
                Tem certeza que deseja excluir o imposto <strong className="text-slate-200">{TAX_TYPE_LABELS[deleteConfirm.taxType]}</strong> de {formatCurrency(deleteConfirm.taxAmount)}?
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
        </div>
      )}
    </div>
  );
}
