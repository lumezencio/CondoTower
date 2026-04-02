"use client";

import React, {
  useEffect, useMemo, useState, useCallback, useRef,
} from "react";
import {
  TrendingDown, Plus, Search, Edit2, Trash2, X, Download,
  ChevronLeft, ChevronRight, Loader2, DollarSign, ChevronUp, ChevronDown,
  CheckCircle2, Clock, AlertTriangle, Filter, ChevronDown as Chevron,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

// ─── Types ───────────────────────────────────────────────────────────────────

type Expense = {
  id: string;
  description: string;
  category: string;
  amount: number;
  dueDate: string;
  paymentDate: string | null;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  paymentMethod: string | null;
  receiptUrl: string | null;
  notes: string | null;
  unit: { id?: string; block: string; number: string } | null;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  description: string; category: string; amount: string;
  dueDate: string; paymentDate: string; paymentMethod: string;
  receiptUrl: string; notes: string;
};

type SortKey = "dueDate" | "amount" | "description" | "status";
type SortOrder = "asc" | "desc";
type QuickFilter = "all" | "today" | "overdue" | "thisMonth" | "lastMonth";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  AGUA: "Água", LUZ: "Luz", GAS: "Gás", INTERNET: "Internet",
  TELEFONE: "Telefone", ELEVADOR: "Elevador", PISCINA: "Piscina",
  JARDIM: "Jardim", LIMPEZA: "Limpeza", SEGURANCA: "Segurança",
  SEGURO: "Seguro", MANUTENCAO: "Manutenção", SALARIO: "Salário",
  ENCARGOS: "Encargos", MATERIAL: "Material",
  SERVICO_TERCEIRIZADO: "Serviço Terceirizado", OUTRO: "Outro",
};

const PAYMENT_METHODS = [
  "PIX", "Transferência Bancária", "Boleto", "Débito Automático",
  "Cartão de Crédito", "Dinheiro", "Cheque",
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente", PAID: "Pago", OVERDUE: "Em Atraso", CANCELLED: "Cancelado",
};

const STATUS_BADGE: Record<string, string> = {
  PAID: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  PENDING: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  OVERDUE: "bg-red-500/20 text-red-300 border border-red-500/30",
  CANCELLED: "bg-slate-500/20 text-slate-400 border border-slate-600/30",
};

const CATEGORY_COLORS: Record<string, string> = {
  AGUA: "bg-blue-500/20 text-blue-300", LUZ: "bg-yellow-500/20 text-yellow-300",
  GAS: "bg-orange-500/20 text-orange-300", INTERNET: "bg-cyan-500/20 text-cyan-300",
  LIMPEZA: "bg-emerald-500/20 text-emerald-300", SEGURANCA: "bg-red-500/20 text-red-300",
  MANUTENCAO: "bg-purple-500/20 text-purple-300", SALARIO: "bg-pink-500/20 text-pink-300",
};

const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR");

const today = () => new Date().toISOString().slice(0, 10);

function relativeDate(dateStr: string): { label: string; cls: string } {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - now.getTime()) / 86400000);
  if (diff === 0) return { label: "Hoje", cls: "bg-amber-500/20 text-amber-300" };
  if (diff === 1) return { label: "Amanhã", cls: "bg-blue-500/20 text-blue-300" };
  if (diff > 1 && diff <= 7) return { label: `${diff} dias`, cls: "bg-slate-600/40 text-slate-300" };
  if (diff < 0) return { label: `Atrasado ${Math.abs(diff)}d`, cls: "bg-red-500/20 text-red-300" };
  return { label: fmtDate(dateStr), cls: "" };
}

const EMPTY_FORM: FormData = {
  description: "", category: "", amount: "", dueDate: "",
  paymentDate: "", paymentMethod: "", receiptUrl: "", notes: "",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  label, value, count, countLabel, icon: Icon, iconCls, pulse, ring,
}: {
  label: string; value: number; count: number; countLabel: string;
  icon: React.ElementType; iconCls: string; pulse?: boolean; ring?: boolean;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-start gap-4">
      <div className="relative mt-0.5">
        {ring && (
          <span className="absolute inset-0 rounded-xl animate-ping opacity-30 bg-red-500/40" />
        )}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconCls}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-400 text-xs font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-white font-mono leading-none">{brl(value)}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          {pulse && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
          <span className="text-xs text-slate-500">{count} {countLabel}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContasPagarPage() {
  const { push: toast } = useToast();

  // Data
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [apiSummary, setApiSummary] = useState({
    totalAmount: 0, pendingAmount: 0, overdueAmount: 0, paidAmount: 0,
  });

  // Pagination & Sort
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pmFilter, setPmFilter] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [payModal, setPayModal] = useState<Expense | null>(null);
  const [payDate, setPayDate] = useState(today());
  const [payMethod, setPayMethod] = useState("");
  const [payReceipt, setPayReceipt] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  const [deleteModal, setDeleteModal] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  // Quick filter date ranges
  const quickDates = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    if (quickFilter === "today") return { dateFrom: todayStr, dateTo: todayStr };
    if (quickFilter === "overdue") return { status: "OVERDUE" };
    if (quickFilter === "thisMonth") {
      const y = now.getFullYear(); const m = now.getMonth();
      return {
        dateFrom: new Date(y, m, 1).toISOString().slice(0, 10),
        dateTo: new Date(y, m + 1, 0).toISOString().slice(0, 10),
      };
    }
    if (quickFilter === "lastMonth") {
      const y = now.getFullYear(); const m = now.getMonth() - 1;
      return {
        dateFrom: new Date(y, m, 1).toISOString().slice(0, 10),
        dateTo: new Date(y, m + 1, 0).toISOString().slice(0, 10),
      };
    }
    return {};
  }, [quickFilter]);

  // Load
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qd = quickDates as Record<string, string>;
      const params = new URLSearchParams({
        page: String(page), pageSize: String(pageSize),
        status: qd.status || statusFilter,
        category: categoryFilter,
        search: debouncedSearch,
        dateFrom: qd.dateFrom || dateFrom,
        dateTo: qd.dateTo || dateTo,
        sort: sortKey, order: sortOrder,
      });
      const res = await fetch(`/api/expenses?${params}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Erro ao carregar despesas");
      setExpenses(json.data || []);
      setTotal(json.total || 0);
      setApiSummary({
        totalAmount: json.totalAmount || 0,
        pendingAmount: json.pendingAmount || 0,
        overdueAmount: json.overdueAmount || 0,
        paidAmount: json.paidAmount || 0,
      });
    } catch (e: unknown) {
      toast({ kind: "error", title: "Erro", message: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, categoryFilter, debouncedSearch, dateFrom, dateTo, sortKey, sortOrder, quickDates, toast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [statusFilter, categoryFilter, debouncedSearch, dateFrom, dateTo, quickFilter, sortKey, sortOrder]);
  useEffect(() => { setSelectedIds(new Set()); }, [expenses]);

  // Summary fallback from page data
  const summary = useMemo(() => {
    if (apiSummary.totalAmount > 0) return apiSummary;
    return {
      totalAmount: expenses.reduce((s, e) => s + e.amount, 0),
      pendingAmount: expenses.filter(e => e.status === "PENDING").reduce((s, e) => s + e.amount, 0),
      overdueAmount: expenses.filter(e => e.status === "OVERDUE").reduce((s, e) => s + e.amount, 0),
      paidAmount: expenses.filter(e => e.status === "PAID").reduce((s, e) => s + e.amount, 0),
    };
  }, [expenses, apiSummary]);

  const counts = useMemo(() => ({
    pending: expenses.filter(e => e.status === "PENDING").length,
    overdue: expenses.filter(e => e.status === "OVERDUE").length,
    paid: expenses.filter(e => e.status === "PAID").length,
  }), [expenses]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Selection helpers
  const allSelected = expenses.length > 0 && expenses.every(e => selectedIds.has(e.id));
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(expenses.map(e => e.id)));
  };
  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const selectedSum = useMemo(() =>
    expenses.filter(e => selectedIds.has(e.id)).reduce((s, e) => s + e.amount, 0),
    [expenses, selectedIds]);

  const visibleSum = useMemo(() =>
    expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  // Sort toggle
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder(o => o === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortOrder("asc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp size={12} className="text-slate-600" />;
    return sortOrder === "asc"
      ? <ChevronUp size={12} className="text-red-400" />
      : <ChevronDown size={12} className="text-red-400" />;
  };

  // Row color
  const rowCls = (e: Expense) => {
    if (e.status === "OVERDUE") return "bg-red-950/20 hover:bg-red-950/30";
    if (e.status === "PENDING") {
      const diff = Math.round((new Date(e.dueDate + "T00:00:00").getTime() - Date.now()) / 86400000);
      if (diff <= 3) return "bg-amber-950/10 hover:bg-amber-950/20";
    }
    return "hover:bg-slate-800/40";
  };

  // Drawer helpers
  const openCreate = () => {
    setEditingExpense(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  };

  const openEdit = (e: Expense) => {
    setEditingExpense(e);
    setForm({
      description: e.description, category: e.category,
      amount: String(e.amount), dueDate: e.dueDate,
      paymentDate: e.paymentDate || "", paymentMethod: e.paymentMethod || "",
      receiptUrl: e.receiptUrl || "", notes: e.notes || "",
    });
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.description || !form.category || !form.amount || !form.dueDate) {
      toast({ kind: "error", title: "Campos obrigatórios", message: "Preencha Descrição, Categoria, Valor e Vencimento." });
      return;
    }
    setSaving(true);
    try {
      const body = {
        description: form.description, category: form.category,
        amount: parseFloat(form.amount.replace(",", ".")),
        dueDate: form.dueDate,
        paymentDate: form.paymentDate || null,
        paymentMethod: form.paymentMethod || null,
        receiptUrl: form.receiptUrl || null,
        notes: form.notes || null,
      };
      const url = editingExpense ? `/api/expenses/${editingExpense.id}` : "/api/expenses";
      const method = editingExpense ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Erro ao salvar");
      toast({ kind: "success", title: editingExpense ? "Despesa atualizada" : "Despesa criada" });
      setDrawerOpen(false);
      load();
    } catch (e: unknown) {
      toast({ kind: "error", title: "Erro", message: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  // Mark paid
  const handleMarkPaid = async () => {
    if (!payModal) return;
    setPayLoading(true);
    try {
      const res = await fetch(`/api/expenses/${payModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID", paymentDate: payDate, paymentMethod: payMethod || null, receiptUrl: payReceipt || null }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Erro");
      toast({ kind: "success", title: "Pagamento confirmado", message: payModal.description });
      setPayModal(null);
      load();
    } catch (e: unknown) {
      toast({ kind: "error", title: "Erro", message: (e as Error).message });
    } finally {
      setPayLoading(false);
    }
  };

  // Bulk mark paid
  const handleBulkPaid = async () => {
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map(id =>
        fetch(`/api/expenses/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "PAID", paymentDate: today() }),
        })
      ));
      toast({ kind: "success", title: `${ids.length} despesa(s) marcadas como pagas` });
      setSelectedIds(new Set());
      load();
    } catch {
      toast({ kind: "error", title: "Erro ao marcar como pagas" });
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/expenses/${deleteModal.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Erro");
      toast({ kind: "success", title: "Despesa excluída" });
      setDeleteModal(null);
      load();
    } catch (e: unknown) {
      toast({ kind: "error", title: "Erro", message: (e as Error).message });
    } finally {
      setDeleting(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map(id => fetch(`/api/expenses/${id}`, { method: "DELETE" })));
      toast({ kind: "success", title: `${ids.length} despesa(s) excluída(s)` });
      setSelectedIds(new Set());
      load();
    } catch {
      toast({ kind: "error", title: "Erro ao excluir" });
    }
  };

  const clearFilters = () => {
    setSearch(""); setStatusFilter(""); setCategoryFilter("");
    setDateFrom(""); setDateTo(""); setPmFilter(""); setQuickFilter("all");
  };

  const inputCls = "bg-slate-800 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-sm px-3 py-2 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all";
  const thCls = "px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider select-none";

  const QUICK_FILTERS: { id: QuickFilter; label: string }[] = [
    { id: "all", label: "Todos" }, { id: "today", label: "Vence Hoje" },
    { id: "overdue", label: "Em Atraso" }, { id: "thisMonth", label: "Este Mês" },
    { id: "lastMonth", label: "Mês Anterior" },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-lg shadow-red-900/40">
            <TrendingDown size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Contas a Pagar</h1>
            <p className="text-slate-500 text-sm">Finanças / Contas a Pagar</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-all text-sm">
            <Download size={15} /> Exportar
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-red-900/30"
          >
            <Plus size={16} /> Nova Despesa
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total do Mês" value={summary.totalAmount} count={expenses.length} countLabel="despesas"
          icon={DollarSign} iconCls="bg-red-500/20 text-red-400" />
        <KpiCard label="A Vencer" value={summary.pendingAmount} count={counts.pending} countLabel="pendentes"
          icon={Clock} iconCls="bg-amber-500/20 text-amber-400" pulse />
        <KpiCard label="Em Atraso" value={summary.overdueAmount} count={counts.overdue} countLabel="em atraso"
          icon={AlertTriangle} iconCls="bg-red-500/20 text-rose-400" ring />
        <KpiCard label="Pagas" value={summary.paidAmount} count={counts.paid} countLabel="pagas"
          icon={CheckCircle2} iconCls="bg-emerald-500/20 text-emerald-400" />
      </div>

      {/* Quick Filter Pills */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {QUICK_FILTERS.map(f => (
          <button key={f.id} onClick={() => setQuickFilter(f.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              quickFilter === f.id
                ? "bg-red-600 text-white shadow-md shadow-red-900/30"
                : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl mb-4">
        <button
          onClick={() => setFiltersOpen(o => !o)}
          className="flex items-center justify-between w-full px-5 py-3.5 text-slate-300 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter size={14} /> Filtros Avançados
          </div>
          <Chevron size={14} className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
        </button>
        {filtersOpen && (
          <div className="px-5 pb-4 border-t border-slate-800/60">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              <div className="relative lg:col-span-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input className={`${inputCls} pl-9 w-full`} placeholder="Buscar descrição..."
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className={`${inputCls} w-full`} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">Todos os status</option>
                {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <select className={`${inputCls} w-full`} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="">Todas as categorias</option>
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <div className="flex gap-2">
                <input type="date" className={`${inputCls} flex-1`} value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="De" />
                <input type="date" className={`${inputCls} flex-1`} value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="Até" />
              </div>
              <select className={`${inputCls} w-full`} value={pmFilter} onChange={e => setPmFilter(e.target.value)}>
                <option value="">Forma de pagamento</option>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <div className="flex items-center gap-3">
                <button onClick={load}
                  className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-semibold hover:opacity-90 transition-all">
                  Aplicar Filtros
                </button>
                <button onClick={clearFilters} className="text-sm text-slate-400 hover:text-red-400 transition-colors">
                  Limpar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 px-4 py-3 mb-4 bg-red-950/50 border border-red-800/50 rounded-xl text-sm">
          <span className="text-red-300 font-medium">{selectedIds.size} selecionado(s)</span>
          <button onClick={handleBulkPaid}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/80 text-white hover:bg-emerald-600 transition-all text-xs font-medium">
            <CheckCircle2 size={13} /> Marcar como Pago
          </button>
          <button onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-700/80 text-white hover:bg-red-700 transition-all text-xs font-medium">
            <Trash2 size={13} /> Excluir
          </button>
          <button onClick={() => setSelectedIds(new Set())}
            className="ml-auto flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-xs">
            <X size={12} /> Desmarcar
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800">
              <tr>
                <th className={`${thCls} w-10`}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-red-500 cursor-pointer" />
                </th>
                <th className={`${thCls} cursor-pointer`} onClick={() => handleSort("description")}>
                  <div className="flex items-center gap-1">Descrição <SortIcon col="description" /></div>
                </th>
                <th className={`${thCls} cursor-pointer`} onClick={() => handleSort("dueDate")}>
                  <div className="flex items-center gap-1">Vencimento <SortIcon col="dueDate" /></div>
                </th>
                <th className={`${thCls} cursor-pointer text-right`} onClick={() => handleSort("amount")}>
                  <div className="flex items-center justify-end gap-1">Valor <SortIcon col="amount" /></div>
                </th>
                <th className={thCls}>Pagamento</th>
                <th className={`${thCls} cursor-pointer`} onClick={() => handleSort("status")}>
                  <div className="flex items-center gap-1">Status <SortIcon col="status" /></div>
                </th>
                <th className={`${thCls} text-right`}>Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <Loader2 size={28} className="animate-spin text-red-500 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Carregando...</p>
                </td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <TrendingDown size={36} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500">Nenhuma despesa encontrada</p>
                </td></tr>
              ) : expenses.map(e => {
                const rel = relativeDate(e.dueDate);
                const catCls = CATEGORY_COLORS[e.category] || "bg-slate-600/20 text-slate-400";
                return (
                  <tr key={e.id} className={`transition-colors ${rowCls(e)} ${selectedIds.has(e.id) ? "bg-red-950/30" : ""}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.has(e.id)} onChange={() => toggleOne(e.id)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-red-500 cursor-pointer" />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-200 truncate max-w-[200px]">{e.description}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catCls}`}>
                          {CATEGORY_LABELS[e.category] || e.category}
                        </span>
                        {e.unit && (
                          <span className="text-xs text-slate-500">
                            {e.unit.block}-{e.unit.number}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-300">{fmtDate(e.dueDate)}</p>
                      {rel.cls && (
                        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${rel.cls}`}>
                          {rel.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-white font-mono">{brl(e.amount)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {e.paymentDate ? (
                        <div>
                          <p className="text-slate-300 text-xs">{fmtDate(e.paymentDate)}</p>
                          {e.paymentMethod && <p className="text-slate-500 text-xs mt-0.5">{e.paymentMethod}</p>}
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGE[e.status]}`}>
                        {STATUS_LABELS[e.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {(e.status === "PENDING" || e.status === "OVERDUE") && (
                          <button
                            onClick={() => { setPayModal(e); setPayDate(today()); setPayMethod(""); setPayReceipt(""); }}
                            title="Marcar como pago"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                          ><CheckCircle2 size={15} /></button>
                        )}
                        <button onClick={() => openEdit(e)} title="Editar"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteModal(e)} title="Excluir"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Total visível: <strong className="text-slate-300 font-mono">{brl(visibleSum)}</strong></span>
            {selectedIds.size > 0 && (
              <span>Selecionado: <strong className="text-red-400 font-mono">{brl(selectedSum)}</strong></span>
            )}
            <span>{total} registro(s)</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-slate-400 px-2">Página {page} de {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Drawer: Create / Edit ─────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl animate-slide-in-right">
            <div className="h-1 bg-gradient-to-r from-red-600 to-rose-600" />
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">{editingExpense ? "Editar Despesa" : "Nova Despesa"}</h2>
              <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Descrição *</label>
                <input className={`${inputCls} w-full`} placeholder="Ex: Conta de água — Jan/2025"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Categoria *</label>
                <select className={`${inputCls} w-full`} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Valor (R$) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">R$</span>
                  <input className={`${inputCls} w-full pl-9`} placeholder="0,00" type="number" step="0.01" min="0"
                    value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Vencimento *</label>
                  <input type="date" className={`${inputCls} w-full`}
                    value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Data de Pagamento</label>
                  <input type="date" className={`${inputCls} w-full`}
                    value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Forma de Pagamento</label>
                <select className={`${inputCls} w-full`} value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">URL do Comprovante</label>
                <input className={`${inputCls} w-full`} placeholder="https://..."
                  value={form.receiptUrl} onChange={e => setForm(f => ({ ...f, receiptUrl: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Observações</label>
                <textarea rows={3} className={`${inputCls} w-full resize-none`} placeholder="Informações adicionais..."
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800">
              <button onClick={() => setDrawerOpen(false)}
                className="px-5 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-sm transition-all">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mark as Paid Modal ────────────────────────────────── */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPayModal(null)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Confirmar Pagamento</h2>
              <p className="text-slate-400 text-sm mt-0.5">{payModal.description}</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Data de Pagamento</label>
                <input type="date" className={`${inputCls} w-full`} value={payDate} onChange={e => setPayDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Forma de Pagamento</label>
                <select className={`${inputCls} w-full`} value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                  <option value="">Selecione...</option>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Comprovante (URL)</label>
                <input className={`${inputCls} w-full`} placeholder="https://..."
                  value={payReceipt} onChange={e => setPayReceipt(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800">
              <button onClick={() => setPayModal(null)} className="px-5 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-sm transition-all">
                Cancelar
              </button>
              <button onClick={handleMarkPaid} disabled={payLoading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60">
                {payLoading && <Loader2 size={14} className="animate-spin" />}
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────── */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteModal(null)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="px-6 pt-6 pb-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Excluir Despesa</h2>
              <p className="text-slate-400 text-sm">Tem certeza que deseja excluir:</p>
              <p className="text-white font-semibold mt-2">{deleteModal.description}</p>
              <p className="text-red-400 font-bold font-mono text-lg mt-0.5">{brl(deleteModal.amount)}</p>
              <p className="text-slate-500 text-xs mt-3">Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex items-center gap-3 px-6 pb-6">
              <button onClick={() => setDeleteModal(null)} className="flex-1 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-sm transition-all">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-60">
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slide-in-right 0.25s ease-out; }
      `}</style>
    </div>
  );
}
