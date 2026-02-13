"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { TrendingDown, Plus, Search, Filter, Edit2, Trash2, X, ChevronLeft, ChevronRight, Loader2, Calendar, DollarSign, FileText, Building2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

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
  unit: {
    block: string;
    number: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  description: string;
  category: string;
  amount: string;
  dueDate: string;
  unitId: string;
  paymentMethod: string;
  receiptUrl: string;
  notes: string;
};

const initialFormData: FormData = {
  description: "",
  category: "MANUTENCAO",
  amount: "",
  dueDate: "",
  unitId: "",
  paymentMethod: "",
  receiptUrl: "",
  notes: "",
};

export default function ContasPagarPage() {
  const { push } = useToast();
  const [list, setList] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Filtros
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filterStatus.trim()) params.set("status", filterStatus.trim());
    if (filterCategory.trim()) params.set("category", filterCategory.trim());
    if (filterSearch.trim()) params.set("search", filterSearch.trim());
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [filterStatus, filterCategory, filterSearch, page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/expenses?${queryString}`, { cache: "no-store" });
      const data = await response.json();
      if (data?.ok) {
        setList(data.data ?? []);
        setTotal(data.total ?? 0);
      } else {
        push({ title: "Erro", message: data?.message || "Falha ao carregar despesas", kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao carregar despesas:", err);
      push({ title: "Erro", message: "Falha de conexão ao carregar despesas", kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [queryString, push]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        description: expense.description,
        category: expense.category,
        amount: expense.amount.toString(),
        dueDate: expense.dueDate.split('T')[0],
        unitId: expense.unit?.id || "",
        paymentMethod: expense.paymentMethod || "",
        receiptUrl: expense.receiptUrl || "",
        notes: expense.notes || "",
      });
    } else {
      setEditingExpense(null);
      setFormData(initialFormData);
    }
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    setFormData(initialFormData);
    setError("");
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim() || !formData.category.trim() || !formData.amount.trim() || !formData.dueDate.trim()) {
      setError("Descrição, categoria, valor e data de vencimento são obrigatórios.");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("Valor inválido.");
      return;
    }

    const payload = {
      description: formData.description.trim(),
      category: formData.category,
      amount: amount,
      dueDate: formData.dueDate,
      unitId: formData.unitId || null,
      paymentMethod: formData.paymentMethod.trim() || null,
      receiptUrl: formData.receiptUrl.trim() || null,
      notes: formData.notes.trim() || null,
    };

    setSaving(true);
    setError("");

    try {
      const url = editingExpense ? `/api/expenses/${editingExpense.id}` : "/api/expenses";
      const method = editingExpense ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data?.ok) {
        closeModal();
        await load();
        push({ 
          title: editingExpense ? "Despesa atualizada!" : "Despesa criada!", 
          message: `A despesa "${payload.description}" foi ${editingExpense ? 'atualizada' : 'criada'} com sucesso.`,
          kind: "success" 
        });
      } else {
        setError(data?.message ?? "Erro ao salvar despesa.");
      }
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/expenses/${deleteConfirm.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data?.ok) {
        setDeleteConfirm(null);
        await load();
        push({ 
          title: "Despesa excluída!", 
          message: `A despesa "${deleteConfirm.description}" foi excluída com sucesso.`,
          kind: "success" 
        });
      } else {
        push({ title: "Erro", message: data?.message ?? "Erro ao excluir despesa.", kind: "error" });
      }
    } catch (err) {
      push({ title: "Erro", message: "Falha de conexão ao excluir despesa.", kind: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterCategory("");
    setFilterSearch("");
    setPage(1);
  };

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">Pago</span>;
      case "OVERDUE":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300">Vencido</span>;
      case "CANCELLED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300">Cancelado</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300">Pendente</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <TrendingDown className="w-7 h-7 text-red-400" />
            Contas a Pagar
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie as despesas e pagamentos do condomínio
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-red-500/25"
        >
          <Plus className="w-5 h-5" />
          Nova Despesa
        </button>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">Filtros</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={filterSearch}
                onChange={(e) => { setFilterSearch(e.target.value); setPage(1); }}
                placeholder="Descrição..."
                className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Status</label>
            <select 
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
              <option value="OVERDUE">Vencido</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Categoria</label>
            <select 
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
            >
              <option value="">Todas</option>
              <option value="AGUA">Água</option>
              <option value="LUZ">Energia</option>
              <option value="GAS">Gás</option>
              <option value="INTERNET">Internet</option>
              <option value="TELEFONE">Telefone</option>
              <option value="ELEVADOR">Elevador</option>
              <option value="PISCINA">Piscina</option>
              <option value="JARDIM">Jardim</option>
              <option value="LIMPEZA">Limpeza</option>
              <option value="SEGURANCA">Segurança</option>
              <option value="SEGURO">Seguro</option>
              <option value="MANUTENCAO">Manutenção</option>
              <option value="SALARIO">Salário</option>
              <option value="ENCARGOS">Encargos</option>
              <option value="MATERIAL">Material</option>
              <option value="SERVICO_TERCEIRIZADO">Terceirizado</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left py-3 px-4 font-medium text-slate-300">Descrição</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Categoria</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Vencimento</th>
                <th className="text-right py-3 px-4 font-medium text-slate-300">Valor</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300">Status</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300 w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                      Carregando despesas...
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <TrendingDown className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    Nenhuma despesa encontrada.
                  </td>
                </tr>
              ) : (
                list.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{expense.description}</div>
                      {expense.unit && (
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <Building2 className="w-3 h-3" />
                          {expense.unit.block} - {expense.unit.number}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 text-red-300 rounded-lg font-medium text-xs">
                        {expense.category.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {formatDate(expense.dueDate)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-200 font-medium">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(expense.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openModal(expense)}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(expense)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <div className="text-sm text-slate-400">
              Mostrando {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} de {total} despesas
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                title="Página anterior"
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (page > 3) pageNum = page - 2 + i;
                  if (page > totalPages - 2) pageNum = totalPages - 4 + i;
                }
                return (
                  <button
                    type="button"
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                      page === pageNum
                        ? "bg-red-600 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                title="Próxima página"
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                {editingExpense ? "Editar Despesa" : "Nova Despesa"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                title="Fechar"
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Descrição <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Ex: Conta de água"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Categoria <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
                  >
                    <option value="AGUA">Água</option>
                    <option value="LUZ">Energia</option>
                    <option value="GAS">Gás</option>
                    <option value="INTERNET">Internet</option>
                    <option value="TELEFONE">Telefone</option>
                    <option value="ELEVADOR">Elevador</option>
                    <option value="PISCINA">Piscina</option>
                    <option value="JARDIM">Jardim</option>
                    <option value="LIMPEZA">Limpeza</option>
                    <option value="SEGURANCA">Segurança</option>
                    <option value="SEGURO">Seguro</option>
                    <option value="MANUTENCAO">Manutenção</option>
                    <option value="SALARIO">Salário</option>
                    <option value="ENCARGOS">Encargos</option>
                    <option value="MATERIAL">Material</option>
                    <option value="SERVICO_TERCEIRIZADO">Terceirizado</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Valor <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      placeholder="0,00"
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Data de Vencimento <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange("dueDate", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Método de Pagamento
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
                  >
                    <option value="">Selecione...</option>
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="PIX">PIX</option>
                    <option value="BOLETO">Boleto</option>
                    <option value="TRANSFERENCIA">Transferência</option>
                    <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                    <option value="CARTAO_DEBITO">Cartão de Débito</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Unidade
                  </label>
                  <select
                    value={formData.unitId}
                    onChange={(e) => handleInputChange("unitId", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
                  >
                    <option value="">Todas as unidades</option>
                    {/* Será populado dinamicamente com unidades */}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    URL do Comprovante
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      value={formData.receiptUrl}
                      onChange={(e) => handleInputChange("receiptUrl", e.target.value)}
                      placeholder="https://exemplo.com/comprovante.pdf"
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Observações
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Informações adicionais..."
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>{editingExpense ? "Salvar Alterações" : "Cadastrar Despesa"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Excluir Despesa?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Deseja realmente excluir a despesa{" "}
                <span className="text-white font-medium">
                  "{deleteConfirm.description}"
                </span>
                ? Esta ação não pode ser desfeita.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    "Excluir"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
