"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FileText, Plus, Search, Filter, Edit2, Trash2, X, ChevronLeft, ChevronRight, Loader2, Calendar, DollarSign, Building2, Receipt, Download, Upload } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type TaxWithholding = {
  id: string;
  taxType: string;
  baseAmount: number;
  taxRate: number;
  taxAmount: number;
  dueDate: string;
  paymentDate: string | null;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  guideUrl: string | null;
  notes: string | null;
  revenue: {
    description: string;
    unit: {
      block: string;
      number: string;
    } | null;
  };
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  revenueId: string;
  taxType: string;
  baseAmount: string;
  taxRate: string;
  taxAmount: string;
  dueDate: string;
  paymentDate: string;
  status: string;
  guideUrl: string;
  notes: string;
};

const initialFormData: FormData = {
  revenueId: "",
  taxType: "ISS",
  baseAmount: "",
  taxRate: "",
  taxAmount: "",
  dueDate: "",
  paymentDate: "",
  status: "PENDING",
  guideUrl: "",
  notes: "",
};

export default function ImpostosRetidosPage() {
  const { push } = useToast();
  const [list, setList] = useState<TaxWithholding[]>([]);
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/taxes?${queryString}`, { cache: "no-store" });
      const data = await response.json();
      if (data?.ok) {
        setList(data.data ?? []);
        setTotal(data.total ?? 0);
      } else {
        push({ title: "Erro", message: data?.message || "Falha ao carregar impostos retidos", kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao carregar impostos retidos:", err);
      push({ title: "Erro", message: "Falha de conexão ao carregar impostos retidos", kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [queryString, push]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (tax?: TaxWithholding) => {
    if (tax) {
      setEditingTax(tax);
      setFormData({
        revenueId: tax.revenue.id,
        taxType: tax.taxType,
        baseAmount: tax.baseAmount.toString(),
        taxRate: tax.taxRate.toString(),
        taxAmount: tax.taxAmount.toString(),
        dueDate: tax.dueDate.split('T')[0],
        paymentDate: tax.paymentDate ? tax.paymentDate.split('T')[0] : "",
        status: tax.status,
        guideUrl: tax.guideUrl || "",
        notes: tax.notes || "",
      });
    } else {
      setEditingTax(null);
      setFormData(initialFormData);
    }
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTax(null);
    setFormData(initialFormData);
    setError("");
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");

    // Calcular automaticamente o valor do imposto quando alterar base ou taxa
    if ((field === 'baseAmount' || field === 'taxRate') && formData.baseAmount && formData.taxRate) {
      const base = parseFloat(formData.baseAmount);
      const rate = parseFloat(formData.taxRate);
      if (!isNaN(base) && !isNaN(rate)) {
        const calculatedTax = base * rate;
        setFormData(prev => ({ ...prev, taxAmount: calculatedTax.toFixed(2) }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.revenueId || !formData.taxType || !formData.baseAmount || !formData.taxRate || !formData.taxAmount || !formData.dueDate) {
      setError("Todos os campos obrigatórios devem ser preenchidos.");
      return;
    }

    const baseAmount = parseFloat(formData.baseAmount);
    const taxRate = parseFloat(formData.taxRate);
    const taxAmount = parseFloat(formData.taxAmount);

    if (isNaN(baseAmount) || isNaN(taxRate) || isNaN(taxAmount) || baseAmount <= 0 || taxRate <= 0 || taxAmount <= 0) {
      setError("Valores inválidos.");
      return;
    }

    const payload = {
      revenueId: formData.revenueId,
      taxType: formData.taxType,
      baseAmount: baseAmount,
      taxRate: taxRate,
      taxAmount: taxAmount,
      dueDate: formData.dueDate,
      paymentDate: formData.paymentDate || null,
      status: formData.status,
      guideUrl: formData.guideUrl.trim() || null,
      notes: formData.notes.trim() || null,
    };

    setSaving(true);
    setError("");

    try {
      const url = editingTax ? `/api/taxes/${editingTax.id}` : "/api/taxes";
      const method = editingTax ? "PUT" : "POST";

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
          title: editingTax ? "Imposto retido atualizado!" : "Imposto retido criado!", 
          message: `O imposto "${payload.taxType}" foi ${editingTax ? 'atualizado' : 'criado'} com sucesso.`,
          kind: "success" 
        });
      } else {
        setError(data?.message ?? "Erro ao salvar imposto retido.");
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
      const response = await fetch(`/api/taxes/${deleteConfirm.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data?.ok) {
        setDeleteConfirm(null);
        await load();
        push({ 
          title: "Imposto retido excluído!", 
          message: `O imposto "${deleteConfirm.taxType}" foi excluído com sucesso.`,
          kind: "success" 
        });
      } else {
        push({ title: "Erro", message: data?.message ?? "Erro ao excluir imposto retido.", kind: "error" });
      }
    } catch (err) {
      push({ title: "Erro", message: "Falha de conexão ao excluir imposto retido.", kind: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterTaxType("");
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
            <FileText className="w-7 h-7 text-amber-400" />
            Impostos Retidos & Guias de Pagamento
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie os impostos retidos nas receitas e gere guias de pagamento
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-amber-500/25"
        >
          <Plus className="w-5 h-5" />
          Novo Imposto
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
                placeholder="Notas ou observações..."
                className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Status</label>
            <select 
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
              <option value="OVERDUE">Vencido</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tipo de Imposto</label>
            <select 
              value={filterTaxType}
              onChange={(e) => { setFilterTaxType(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
            >
              <option value="">Todos</option>
              <option value="COFINS">COFINS</option>
              <option value="CSLL">CSLL</option>
              <option value="IRPJ">IRPJ</option>
              <option value="PIS">PIS</option>
              <option value="ISS">ISS</option>
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
                <th className="text-left py-3 px-4 font-medium text-slate-300">Receita</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Tipo</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Unidade</th>
                <th className="text-right py-3 px-4 font-medium text-slate-300">Base</th>
                <th className="text-right py-3 px-4 font-medium text-slate-300">Taxa (%)</th>
                <th className="text-right py-3 px-4 font-medium text-slate-300">Valor</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Vencimento</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300">Status</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300 w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                      Carregando impostos retidos...
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    Nenhum imposto retido encontrado.
                  </td>
                </tr>
              ) : (
                list.map((tax) => (
                  <tr
                    key={tax.id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{tax.revenue.description}</div>
                      {tax.guideUrl && (
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <Receipt className="w-3 h-3" />
                          <a 
                            href={tax.guideUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            Guia de Pagamento
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg font-medium text-xs">
                        {tax.taxType}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {tax.revenue.unit ? (
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {tax.revenue.unit.block} - {tax.revenue.unit.number}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-200 font-medium">
                      {formatCurrency(tax.baseAmount)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-200 font-medium">
                      {(tax.taxRate * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right text-slate-200 font-medium">
                      {formatCurrency(tax.taxAmount)}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {formatDate(tax.dueDate)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(tax.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openModal(tax)}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(tax)}
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
              Mostrando {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} de {total} impostos
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
                        ? "bg-amber-600 text-white"
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
                <FileText className="w-5 h-5 text-amber-400" />
                {editingTax ? "Editar Imposto Retido" : "Novo Imposto Retido"}
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
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Receita <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={formData.revenueId}
                    onChange={(e) => handleInputChange("revenueId", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                  >
                    <option value="">Selecione uma receita</option>
                    {/* Será populado dinamicamente com receitas */}
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Tipo de Imposto <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={formData.taxType}
                    onChange={(e) => handleInputChange("taxType", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                  >
                    <option value="COFINS">COFINS</option>
                    <option value="CSLL">CSLL</option>
                    <option value="IRPJ">IRPJ</option>
                    <option value="PIS">PIS</option>
                    <option value="ISS">ISS</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Valor Base <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.baseAmount}
                      onChange={(e) => handleInputChange("baseAmount", e.target.value)}
                      placeholder="0,00"
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Taxa (%) <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.taxRate}
                      onChange={(e) => handleInputChange("taxRate", e.target.value)}
                      placeholder="0,00"
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-8 pr-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Valor do Imposto <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.taxAmount}
                      readOnly
                      className="w-full rounded-lg border border-white/10 bg-slate-800/50 text-slate-300 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Data de Vencimento <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange("dueDate", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Data de Pagamento
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => handleInputChange("paymentDate", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Status <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                  >
                    <option value="PENDING">Pendente</option>
                    <option value="PAID">Pago</option>
                    <option value="OVERDUE">Vencido</option>
                    <option value="CANCELLED">Cancelado</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    URL da Guia de Pagamento
                  </label>
                  <div className="relative">
                    <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      value={formData.guideUrl}
                      onChange={(e) => handleInputChange("guideUrl", e.target.value)}
                      placeholder="https://exemplo.com/guia-pagamento.pdf"
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
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
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <div className="text-sm text-slate-400">
                  <p>Campos marcados com <span className="text-amber-400">*</span> são obrigatórios</p>
                </div>
                <div className="flex items-center gap-3">
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
                    className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>{editingTax ? "Salvar Alterações" : "Cadastrar Imposto"}</>
                    )}
                  </button>
                </div>
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
                Excluir Imposto Retido?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Deseja realmente excluir o imposto{" "}
                <span className="text-white font-medium">
                  "{deleteConfirm.taxType}"
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