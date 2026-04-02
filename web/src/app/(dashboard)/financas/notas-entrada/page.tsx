"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  FileInput,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  Calculator,
  Building2,
  Receipt,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RetencaoImposto = {
  id: string;
  tipoImposto: "INSS" | "IRRF" | "ISS" | "CSLL" | "COFINS" | "PIS" | "OUTRO";
  baseCalculo: number;
  aliquota: number;
  valorRetido: number;
  codigoRecolhimento: string | null;
  dataVencimento: string;
  dataPagamento: string | null;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
};

type NotaEntrada = {
  id: string;
  numero: string;
  serie: string | null;
  dataEmissao: string;
  dataEntrada: string;
  tipoFornecedor: "PJ" | "PF";
  fornecedor: string;
  cnpjFornecedor: string | null;
  cpfFornecedor: string | null;
  simplesNacional: boolean;
  tipoServico: string;
  descricao: string;
  valorBruto: number;
  valorLiquido: number | null;
  status: "PENDENTE" | "PROCESSADA" | "CANCELADA" | "REJEITADA";
  retencoes: RetencaoImposto[];
  createdAt: string;
};

type FormData = {
  numero: string;
  serie: string;
  dataEmissao: string;
  tipoFornecedor: "PJ" | "PF";
  fornecedor: string;
  cnpjFornecedor: string;
  cpfFornecedor: string;
  simplesNacional: boolean;
  tipoServico: string;
  descricao: string;
  valorBruto: string;
  observacoes: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const initialFormData: FormData = {
  numero: "",
  serie: "",
  dataEmissao: "",
  tipoFornecedor: "PJ",
  fornecedor: "",
  cnpjFornecedor: "",
  cpfFornecedor: "",
  simplesNacional: false,
  tipoServico: "MANUTENCAO",
  descricao: "",
  valorBruto: "",
  observacoes: "",
};

const servicoLabels: Record<string, string> = {
  LIMPEZA: "Limpeza",
  SEGURANCA: "Segurança",
  MANUTENCAO: "Manutenção",
  TI: "TI",
  PROFISSIONAL: "Profissional",
  OUTRO: "Outro",
};

const servicoSelectLabels: Record<string, string> = {
  LIMPEZA: "Limpeza/Conservação",
  SEGURANCA: "Vigilância/Segurança",
  MANUTENCAO: "Manutenção",
  TI: "TI/Tecnologia",
  PROFISSIONAL: "Serviços Profissionais",
  OUTRO: "Outro",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateString: string) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("pt-BR");
}

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function getNotaStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDENTE: "Pendente",
    PROCESSADA: "Processada",
    CANCELADA: "Cancelada",
    REJEITADA: "Rejeitada",
  };
  return labels[status] || status;
}

function getNotaStatusClass(status: string) {
  const classes: Record<string, string> = {
    PENDENTE: "bg-amber-500/20 text-amber-300",
    PROCESSADA: "bg-emerald-500/20 text-emerald-300",
    CANCELADA: "bg-red-500/20 text-red-300",
    REJEITADA: "bg-slate-500/20 text-slate-300",
  };
  return classes[status] || classes.PENDENTE;
}

function getRetencaoStatusClass(status: string) {
  const classes: Record<string, string> = {
    PENDING: "bg-amber-500/20 text-amber-300",
    PAID: "bg-emerald-500/20 text-emerald-300",
    OVERDUE: "bg-red-500/20 text-red-300",
    CANCELLED: "bg-slate-500/20 text-slate-300",
  };
  return classes[status] || classes.PENDING;
}

function getRetencaoStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    PAID: "Pago",
    OVERDUE: "Atrasado",
    CANCELLED: "Cancelado",
  };
  return labels[status] || status;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NotasEntradaPage() {
  const { push } = useToast();

  // List state
  const [list, setList] = useState<NotaEntrada[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Filters
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTipoFornecedor, setFilterTipoFornecedor] = useState("");
  const [filterTipoServico, setFilterTipoServico] = useState("");

  // Create/Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNota, setEditingNota] = useState<NotaEntrada | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // CNPJ lookup
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjData, setCnpjData] = useState<{ nome: string; simples: boolean; situacao: string } | null>(null);
  const [cnpjError, setCnpjError] = useState("");

  // Impostos modal
  const [impostosNota, setImpostosNota] = useState<NotaEntrada | null>(null);
  const [recalculating, setRecalculating] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<NotaEntrada | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  // ---------------------------------------------------------------------------
  // Stats computed from list
  // ---------------------------------------------------------------------------

  const stats = useMemo(() => {
    const totalNotas = total;
    const pendentes = list.filter((n) => n.status === "PENDENTE").length;
    const processadas = list.filter((n) => n.status === "PROCESSADA").length;
    const totalRetido = list.reduce((acc, n) => {
      return acc + n.retencoes.reduce((s, r) => s + r.valorRetido, 0);
    }, 0);
    return { totalNotas, pendentes, processadas, totalRetido };
  }, [list, total]);

  // ---------------------------------------------------------------------------
  // Totals row
  // ---------------------------------------------------------------------------

  const totalsRow = useMemo(() => {
    const bruto = list.reduce((acc, n) => acc + n.valorBruto, 0);
    const retido = list.reduce((acc, n) => acc + n.retencoes.reduce((s, r) => s + r.valorRetido, 0), 0);
    const liquido = list.reduce((acc, n) => acc + (n.valorLiquido ?? n.valorBruto - n.retencoes.reduce((s, r) => s + r.valorRetido, 0)), 0);
    return { bruto, retido, liquido };
  }, [list]);

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filterSearch.trim()) params.set("search", filterSearch.trim());
    if (filterStatus.trim()) params.set("status", filterStatus.trim());
    if (filterTipoFornecedor.trim()) params.set("tipoFornecedor", filterTipoFornecedor.trim());
    if (filterTipoServico.trim()) params.set("tipoServico", filterTipoServico.trim());
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [filterSearch, filterStatus, filterTipoFornecedor, filterTipoServico, page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notas-entrada?${queryString}`, { cache: "no-store" });
      const data = await res.json();
      if (data?.ok) {
        setList(data.data ?? []);
        setTotal(data.total ?? 0);
      } else {
        push({ title: "Erro", message: data?.message || "Falha ao carregar notas", kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao carregar notas de entrada:", err);
      push({ title: "Erro", message: "Falha de conexão ao carregar notas", kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [queryString, push]);

  useEffect(() => {
    load();
  }, [load]);

  // ---------------------------------------------------------------------------
  // Modal helpers
  // ---------------------------------------------------------------------------

  function openNewModal() {
    setEditingNota(null);
    setFormData(initialFormData);
    setFormError("");
    setCnpjData(null);
    setCnpjError("");
    setIsModalOpen(true);
  }

  function openEditModal(nota: NotaEntrada) {
    setEditingNota(nota);
    setFormData({
      numero: nota.numero,
      serie: nota.serie ?? "",
      dataEmissao: nota.dataEmissao.split("T")[0],
      tipoFornecedor: nota.tipoFornecedor,
      fornecedor: nota.fornecedor,
      cnpjFornecedor: nota.cnpjFornecedor ?? "",
      cpfFornecedor: nota.cpfFornecedor ?? "",
      simplesNacional: nota.simplesNacional,
      tipoServico: nota.tipoServico,
      descricao: nota.descricao,
      valorBruto: String(nota.valorBruto),
      observacoes: "",
    });
    setFormError("");
    setCnpjData(null);
    setCnpjError("");
    setIsModalOpen(true);
  }

  function handleInputChange(field: keyof FormData, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  // ---------------------------------------------------------------------------
  // CNPJ lookup
  // ---------------------------------------------------------------------------

  const lookupCnpj = async () => {
    const cnpj = formData.cnpjFornecedor.replace(/\D/g, "");
    if (cnpj.length !== 14) {
      setCnpjError("CNPJ deve ter 14 dígitos");
      return;
    }
    setCnpjLoading(true);
    setCnpjError("");
    setCnpjData(null);
    try {
      const res = await fetch(`/api/cnpj/${cnpj}`);
      const data = await res.json();
      if (data.ok) {
        setCnpjData(data.data);
        handleInputChange("fornecedor", data.data.nome);
        if (data.data.simples) handleInputChange("simplesNacional", true);
      } else {
        setCnpjError(data.message || "CNPJ não encontrado");
      }
    } catch {
      setCnpjError("Erro ao consultar CNPJ");
    } finally {
      setCnpjLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!formData.numero.trim()) {
      setFormError("Número da nota é obrigatório");
      return;
    }
    if (!formData.dataEmissao) {
      setFormError("Data de emissão é obrigatória");
      return;
    }
    if (!formData.fornecedor.trim()) {
      setFormError("Fornecedor é obrigatório");
      return;
    }
    if (!formData.descricao.trim()) {
      setFormError("Descrição é obrigatória");
      return;
    }
    if (!formData.valorBruto || Number(formData.valorBruto) <= 0) {
      setFormError("Valor bruto deve ser maior que zero");
      return;
    }

    setSaving(true);
    try {
      const body = {
        numero: formData.numero.trim(),
        serie: formData.serie.trim() || null,
        dataEmissao: formData.dataEmissao,
        tipoFornecedor: formData.tipoFornecedor,
        fornecedor: formData.fornecedor.trim(),
        cnpjFornecedor: formData.tipoFornecedor === "PJ" ? formData.cnpjFornecedor.replace(/\D/g, "") || null : null,
        cpfFornecedor: formData.tipoFornecedor === "PF" ? formData.cpfFornecedor.replace(/\D/g, "") || null : null,
        simplesNacional: formData.tipoFornecedor === "PJ" ? formData.simplesNacional : false,
        tipoServico: formData.tipoServico,
        descricao: formData.descricao.trim(),
        valorBruto: Number(formData.valorBruto),
        observacoes: formData.observacoes.trim() || null,
      };

      const url = editingNota ? `/api/notas-entrada/${editingNota.id}` : "/api/notas-entrada";
      const method = editingNota ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.ok) {
        push({
          title: editingNota ? "Nota atualizada" : "Nota criada",
          message: `Nota fiscal ${editingNota ? "atualizada" : "criada"} com sucesso`,
          kind: "success",
        });
        setIsModalOpen(false);
        await load();
        // After creating, open impostos panel for the new nota
        if (!editingNota && data.data) {
          setImpostosNota(data.data);
        }
      } else {
        setFormError(data.message || "Erro ao salvar nota");
        push({ title: "Erro", message: data.message, kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao salvar nota:", err);
      setFormError("Erro de conexão ao salvar nota");
      push({ title: "Erro", message: "Falha de conexão", kind: "error" });
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Recalculate taxes
  // ---------------------------------------------------------------------------

  async function handleRecalcular() {
    if (!impostosNota) return;
    setRecalculating(true);
    try {
      const res = await fetch(`/api/notas-entrada/${impostosNota.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "recalcular" }),
      });
      const data = await res.json();
      if (data.ok) {
        push({ title: "Impostos calculados", message: "Retenções apuradas com sucesso", kind: "success" });
        setImpostosNota(data.data);
        await load();
      } else {
        push({ title: "Erro", message: data.message || "Erro ao recalcular impostos", kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao recalcular impostos:", err);
      push({ title: "Erro", message: "Falha ao recalcular impostos", kind: "error" });
    } finally {
      setRecalculating(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/notas-entrada/${deleteConfirm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        push({ title: "Nota excluída", message: "Nota fiscal excluída com sucesso", kind: "success" });
        setDeleteConfirm(null);
        load();
      } else {
        push({ title: "Erro", message: data.message, kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao excluir nota:", err);
      push({ title: "Erro", message: "Falha ao excluir nota", kind: "error" });
    } finally {
      setDeleting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <FileInput className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Notas de Entrada</h1>
            <p className="text-sm text-neutral-400">
              Lance notas fiscais de prestadores com apuração automática de impostos retidos
            </p>
          </div>
        </div>
        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nova Nota
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
          <div className="flex items-center gap-3 mb-2">
            <Receipt className="w-5 h-5 text-violet-400" />
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Total Notas</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalNotas}</p>
        </div>
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.pendentes}</p>
        </div>
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Processadas</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.processadas}</p>
        </div>
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="w-5 h-5 text-violet-400" />
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Total Retido</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRetido)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[220px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Buscar por fornecedor ou descrição..."
              value={filterSearch}
              onChange={(e) => { setFilterSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
          >
            <option value="">Todos Status</option>
            <option value="PENDENTE">Pendente</option>
            <option value="PROCESSADA">Processada</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="REJEITADA">Rejeitada</option>
          </select>
          <select
            value={filterTipoFornecedor}
            onChange={(e) => { setFilterTipoFornecedor(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
          >
            <option value="">PJ / PF</option>
            <option value="PJ">Pessoa Jurídica</option>
            <option value="PF">Pessoa Física</option>
          </select>
          <select
            value={filterTipoServico}
            onChange={(e) => { setFilterTipoServico(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
          >
            <option value="">Todos Serviços</option>
            {Object.entries(servicoSelectLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-800/60 border-b border-neutral-700">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide">NF nº</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide">Fornecedor</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide">Serviço</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide">Data</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-neutral-400 uppercase tracking-wide">Valor Bruto</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-neutral-400 uppercase tracking-wide">Valor Líquido</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
                      <span className="text-neutral-400">Carregando notas de entrada...</span>
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center">
                        <FileInput className="w-8 h-8 text-neutral-600" />
                      </div>
                      <p className="text-neutral-400 font-medium">Nenhuma nota de entrada encontrada</p>
                      <p className="text-neutral-500 text-sm">Cadastre a primeira nota fiscal do condomínio</p>
                    </div>
                  </td>
                </tr>
              ) : (
                list.map((nota) => {
                  const totalRetidoNota = nota.retencoes.reduce((s, r) => s + r.valorRetido, 0);
                  const liquidoNota = nota.valorLiquido ?? nota.valorBruto - totalRetidoNota;
                  return (
                    <tr key={nota.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-white text-sm">{nota.numero}</p>
                          {nota.serie && <p className="text-xs text-neutral-500">Série: {nota.serie}</p>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-white text-sm">{nota.fornecedor}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {nota.tipoFornecedor === "PJ"
                              ? nota.cnpjFornecedor
                                ? formatCnpj(nota.cnpjFornecedor)
                                : "CNPJ não informado"
                              : nota.cpfFornecedor
                              ? formatCpf(nota.cpfFornecedor)
                              : "CPF não informado"}
                            {nota.simplesNacional && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300">
                                Simples
                              </span>
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-500/20 text-violet-300">
                          {servicoLabels[nota.tipoServico] || nota.tipoServico}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-neutral-300">{formatDate(nota.dataEmissao)}</p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="font-semibold text-white text-sm">{formatCurrency(nota.valorBruto)}</p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="font-semibold text-emerald-400 text-sm">{formatCurrency(liquidoNota)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getNotaStatusClass(nota.status)}`}>
                          {getNotaStatusLabel(nota.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setImpostosNota(nota)}
                            className="p-2 hover:bg-violet-500/20 rounded-lg transition-colors group"
                            title="Ver Impostos"
                          >
                            <Eye className="w-4 h-4 text-violet-400 group-hover:text-violet-300" />
                          </button>
                          <button
                            onClick={() => openEditModal(nota)}
                            className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4 text-neutral-400" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(nota)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Totals row */}
        {list.length > 0 && (
          <div className="border-t border-neutral-700 px-5 py-3 flex items-center justify-between bg-neutral-800/40">
            <p className="text-xs text-neutral-400">
              Total bruto:{" "}
              <span className="font-semibold text-white">{formatCurrency(totalsRow.bruto)}</span>
              {" | "}Total retido:{" "}
              <span className="font-semibold text-red-400">{formatCurrency(totalsRow.retido)}</span>
              {" | "}Total líquido:{" "}
              <span className="font-semibold text-emerald-400">{formatCurrency(totalsRow.liquido)}</span>
            </p>
            <p className="text-xs text-neutral-500">
              {list.length} de {total} notas
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-neutral-700 px-5 py-4 flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              Página <span className="font-medium text-neutral-300">{page}</span> de{" "}
              <span className="font-medium text-neutral-300">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-400" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-violet-600 text-white"
                        : "hover:bg-neutral-700 text-neutral-400"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== VER IMPOSTOS MODAL ===== */}
      {impostosNota && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-neutral-900 border-b border-neutral-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Impostos Retidos</h2>
                  <p className="text-xs text-neutral-400">NF {impostosNota.numero} — {impostosNota.fornecedor}</p>
                </div>
              </div>
              <button
                onClick={() => setImpostosNota(null)}
                className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Nota summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-neutral-800 rounded-xl p-3">
                  <p className="text-xs text-neutral-500 mb-1">Fornecedor</p>
                  <p className="text-sm font-semibold text-white">{impostosNota.fornecedor}</p>
                  {impostosNota.tipoFornecedor === "PJ" && impostosNota.cnpjFornecedor && (
                    <p className="text-xs text-neutral-400 mt-0.5">{formatCnpj(impostosNota.cnpjFornecedor)}</p>
                  )}
                  {impostosNota.tipoFornecedor === "PF" && impostosNota.cpfFornecedor && (
                    <p className="text-xs text-neutral-400 mt-0.5">{formatCpf(impostosNota.cpfFornecedor)}</p>
                  )}
                </div>
                <div className="bg-neutral-800 rounded-xl p-3">
                  <p className="text-xs text-neutral-500 mb-1">Valor Bruto</p>
                  <p className="text-sm font-semibold text-white">{formatCurrency(impostosNota.valorBruto)}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{servicoLabels[impostosNota.tipoServico] || impostosNota.tipoServico}</p>
                </div>
                <div className="bg-neutral-800 rounded-xl p-3">
                  <p className="text-xs text-neutral-500 mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getNotaStatusClass(impostosNota.status)}`}>
                    {getNotaStatusLabel(impostosNota.status)}
                  </span>
                  {impostosNota.simplesNacional && (
                    <p className="text-xs text-amber-400 mt-1">Simples Nacional</p>
                  )}
                </div>
              </div>

              {/* Retencoes table */}
              {impostosNota.retencoes.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10">
                  <div className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center">
                    <Receipt className="w-7 h-7 text-neutral-600" />
                  </div>
                  <p className="text-neutral-400 font-medium">Nenhuma retenção apurada</p>
                  <p className="text-neutral-500 text-sm text-center">
                    Clique em "Calcular Impostos" para apurar as retenções desta nota.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-800 border-b border-neutral-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-400 uppercase">Tipo</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-400 uppercase">Base Cálculo</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-400 uppercase">Alíquota</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-400 uppercase">Valor Retido</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-400 uppercase">Cód. DARF</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-400 uppercase">Vencimento</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {impostosNota.retencoes.map((ret) => (
                        <tr key={ret.id} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-500/20 text-violet-300">
                              {ret.tipoImposto}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-neutral-300">{formatCurrency(ret.baseCalculo)}</td>
                          <td className="px-4 py-3 text-right text-neutral-300">{ret.aliquota.toFixed(2)}%</td>
                          <td className="px-4 py-3 text-right font-semibold text-red-400">{formatCurrency(ret.valorRetido)}</td>
                          <td className="px-4 py-3 text-neutral-400 text-xs">{ret.codigoRecolhimento || "—"}</td>
                          <td className="px-4 py-3 text-neutral-300 text-xs">{formatDate(ret.dataVencimento)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getRetencaoStatusClass(ret.status)}`}>
                              {getRetencaoStatusLabel(ret.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totals */}
              {impostosNota.retencoes.length > 0 && (
                <div className="bg-neutral-800 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-neutral-500 text-xs">Valor Bruto</p>
                      <p className="font-semibold text-white">{formatCurrency(impostosNota.valorBruto)}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500 text-xs">Total Retido</p>
                      <p className="font-semibold text-red-400">
                        {formatCurrency(impostosNota.retencoes.reduce((s, r) => s + r.valorRetido, 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500 text-xs">Valor Líquido</p>
                      <p className="font-semibold text-emerald-400">
                        {formatCurrency(
                          impostosNota.valorLiquido ??
                            impostosNota.valorBruto - impostosNota.retencoes.reduce((s, r) => s + r.valorRetido, 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  {impostosNota.status === "PENDENTE" && (
                    <button
                      onClick={handleRecalcular}
                      disabled={recalculating}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {recalculating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      {recalculating ? "Calculando..." : "Calcular Impostos"}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setImpostosNota(null)}
                  className="px-4 py-2 border border-neutral-700 rounded-xl text-neutral-300 hover:bg-neutral-800 transition-colors font-medium text-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CREATE / EDIT MODAL ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-neutral-900 border-b border-neutral-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <FileInput className="w-5 h-5 text-violet-400" />
                </div>
                <h2 className="text-lg font-bold text-white">
                  {editingNota ? "Editar Nota de Entrada" : "Nova Nota de Entrada"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {formError}
                </div>
              )}

              {/* Numero + Serie */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                    Número da NF <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => handleInputChange("numero", e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm placeholder-neutral-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                    placeholder="Ex: 000123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Série</label>
                  <input
                    type="text"
                    value={formData.serie}
                    onChange={(e) => handleInputChange("serie", e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm placeholder-neutral-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                    placeholder="A"
                  />
                </div>
              </div>

              {/* Data emissao + Tipo fornecedor */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                    Data de Emissão <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dataEmissao}
                    onChange={(e) => handleInputChange("dataEmissao", e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Tipo de Fornecedor</label>
                  <div className="flex gap-3 mt-1">
                    {(["PJ", "PF"] as const).map((tipo) => (
                      <label key={tipo} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tipoFornecedor"
                          value={tipo}
                          checked={formData.tipoFornecedor === tipo}
                          onChange={() => {
                            handleInputChange("tipoFornecedor", tipo);
                            setCnpjData(null);
                            setCnpjError("");
                          }}
                          className="accent-violet-500"
                        />
                        <span className="text-sm text-neutral-300">
                          {tipo === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fornecedor */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Fornecedor <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fornecedor}
                  onChange={(e) => handleInputChange("fornecedor", e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm placeholder-neutral-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                  placeholder="Nome do fornecedor"
                />
              </div>

              {/* CNPJ (PJ) */}
              {formData.tipoFornecedor === "PJ" && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">CNPJ</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.cnpjFornecedor}
                        onChange={(e) => {
                          handleInputChange("cnpjFornecedor", formatCnpj(e.target.value));
                          setCnpjData(null);
                          setCnpjError("");
                        }}
                        className="flex-1 px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm placeholder-neutral-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                      />
                      <button
                        type="button"
                        onClick={lookupCnpj}
                        disabled={cnpjLoading}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cnpjLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ExternalLink className="w-4 h-4" />
                        )}
                        {cnpjLoading ? "Consultando..." : "Consultar CNPJ"}
                      </button>
                    </div>
                  </div>
                  {cnpjError && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {cnpjError}
                    </div>
                  )}
                  {cnpjData && (
                    <div className="flex items-start gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-emerald-400 text-xs font-medium">CNPJ válido — {cnpjData.nome}</p>
                        {cnpjData.simples && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 mt-1">
                            Simples Nacional
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Simples Nacional checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.simplesNacional}
                      onChange={(e) => handleInputChange("simplesNacional", e.target.checked)}
                      className="accent-violet-500 w-4 h-4"
                    />
                    <span className="text-sm text-neutral-300">Optante pelo Simples Nacional</span>
                  </label>
                </div>
              )}

              {/* CPF (PF) */}
              {formData.tipoFornecedor === "PF" && (
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">CPF</label>
                  <input
                    type="text"
                    value={formData.cpfFornecedor}
                    onChange={(e) => handleInputChange("cpfFornecedor", formatCpf(e.target.value))}
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm placeholder-neutral-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
              )}

              {/* Tipo Serviço */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Tipo de Serviço</label>
                <select
                  value={formData.tipoServico}
                  onChange={(e) => handleInputChange("tipoServico", e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                >
                  {Object.entries(servicoSelectLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Descrição <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => handleInputChange("descricao", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm placeholder-neutral-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all resize-none"
                  placeholder="Descreva o serviço prestado..."
                />
              </div>

              {/* Valor Bruto */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Valor Bruto (R$) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.valorBruto}
                    onChange={(e) => handleInputChange("valorBruto", e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm placeholder-neutral-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange("observacoes", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm placeholder-neutral-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all resize-none"
                  placeholder="Informações adicionais (opcional)..."
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-neutral-700 rounded-xl text-neutral-300 hover:bg-neutral-800 transition-colors font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Salvando..." : editingNota ? "Atualizar Nota" : "Criar Nota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRM MODAL ===== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Excluir Nota?</h3>
                <p className="text-sm text-neutral-400">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <p className="text-sm text-neutral-300 mb-6">
              Tem certeza que deseja excluir a nota{" "}
              <strong className="text-white">NF {deleteConfirm.numero}</strong> de{" "}
              <strong className="text-white">{deleteConfirm.fornecedor}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2.5 border border-neutral-700 rounded-xl text-neutral-300 hover:bg-neutral-800 transition-colors font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? "Excluindo..." : "Excluir Nota"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
