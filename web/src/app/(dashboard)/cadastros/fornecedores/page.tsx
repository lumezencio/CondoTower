"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Truck, Plus, Search, Edit2, Trash2, X, ChevronLeft, ChevronRight,
  Loader2, Phone, Mail, Building2, MapPin, FileText, RefreshCw,
  Globe, Hash,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

type Fornecedor = {
  id: string;
  name: string;
  type: "FORNECEDOR";
  category: string | null;
  phone: string;
  phone2: string | null;
  email: string | null;
  department: string | null; // used for CNPJ/CPF
  notes: string | null;
  createdAt: string;
};

type FormData = {
  name: string;
  category: string;
  phone: string;
  phone2: string;
  email: string;
  department: string;
  notes: string;
};

const initialFormData: FormData = {
  name: "",
  category: "MANUTENCAO",
  phone: "",
  phone2: "",
  email: "",
  department: "",
  notes: "",
};

const CATEGORY_LABELS: Record<string, string> = {
  LIMPEZA: "Limpeza",
  SEGURANCA: "Segurança",
  MANUTENCAO: "Manutenção",
  ELETRICA: "Elétrica",
  HIDRAULICA: "Hidráulica",
  ELEVADOR: "Elevadores",
  JARDINAGEM: "Jardinagem",
  PINTURA: "Pintura",
  DEDETIZACAO: "Dedetização",
  CONTABILIDADE: "Contabilidade",
  ADVOCACIA: "Advocacia",
  TI: "Tecnologia",
  OUTRO: "Outro",
};

const CATEGORY_COLORS: Record<string, string> = {
  LIMPEZA: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  SEGURANCA: "bg-red-500/20 text-red-300 border-red-500/30",
  MANUTENCAO: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  ELETRICA: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  HIDRAULICA: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  ELEVADOR: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  JARDINAGEM: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  PINTURA: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  DEDETIZACAO: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  CONTABILIDADE: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  ADVOCACIA: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  TI: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  OUTRO: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export default function FornecedoresPage() {
  const { push } = useToast();
  const [list, setList] = useState<Fornecedor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  const [filterSearch, setFilterSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Fornecedor | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState<Fornecedor | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("type", "FORNECEDOR");
    params.set("tenant", "parkclub");
    if (filterSearch.trim()) params.set("search", filterSearch.trim());
    if (filterCategory.trim()) params.set("category", filterCategory.trim());
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [filterSearch, filterCategory, page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contacts?${queryString}`, { cache: "no-store" });
      const data = await res.json();
      if (data?.ok) {
        setList(data.data ?? []);
        setTotal(data.total ?? 0);
      } else {
        push({ title: "Erro", message: data?.message || "Falha ao carregar fornecedores", kind: "error" });
      }
    } catch {
      push({ title: "Erro", message: "Falha de conexão", kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [queryString, push]);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setDrawerOpen(true);
    setEditing(null);
    setFormData(initialFormData);
    setError("");
  }

  function openEdit(f: Fornecedor) {
    setDrawerOpen(true);
    setEditing(f);
    setFormData({
      name: f.name,
      category: f.category ?? "OUTRO",
      phone: f.phone,
      phone2: f.phone2 ?? "",
      email: f.email ?? "",
      department: f.department ?? "",
      notes: f.notes ?? "",
    });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) { setError("Nome é obrigatório"); return; }
    if (!formData.phone.trim()) { setError("Telefone é obrigatório"); return; }

    setSaving(true);
    try {
      const body = {
        ...formData,
        type: "FORNECEDOR",
        tenant: "parkclub",
      };

      const url = editing ? `/api/contacts/${editing.id}` : "/api/contacts";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.ok) {
        push({
          title: editing ? "Fornecedor atualizado" : "Fornecedor cadastrado",
          message: `${formData.name} foi ${editing ? "atualizado" : "cadastrado"} com sucesso`,
          kind: "success",
        });
        setDrawerOpen(false);
        load();
      } else {
        setError(data.message || "Erro ao salvar");
        push({ title: "Erro", message: data.message, kind: "error" });
      }
    } catch {
      setError("Erro de conexão");
      push({ title: "Erro", message: "Falha de conexão", kind: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/contacts/${deleteConfirm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        push({ title: "Fornecedor excluído", message: "Fornecedor removido com sucesso", kind: "success" });
        load();
      } else {
        push({ title: "Erro", message: data.message, kind: "error" });
      }
    } catch {
      push({ title: "Erro", message: "Falha ao excluir", kind: "error" });
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  }

  const initial = (name: string) => name.charAt(0).toUpperCase();

  const inputCls = "bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-500";
  const selectCls = `${inputCls} cursor-pointer`;

  // Category stats from current page data
  const categoryCounts = list.reduce<Record<string, number>>((acc, f) => {
    const cat = f.category ?? "OUTRO";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 border border-teal-500/30">
              <Truck className="w-6 h-6 text-teal-400" />
            </div>
            Cadastro de Fornecedores
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Gerencie fornecedores e prestadores de serviço do condomínio</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 border border-slate-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg hover:from-teal-400 hover:to-cyan-400 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Fornecedor
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: total, color: "border-teal-500", icon: Truck, iconCls: "text-teal-400" },
          { label: "Manutenção", value: categoryCounts.MANUTENCAO ?? 0, color: "border-orange-500", icon: Building2, iconCls: "text-orange-400" },
          { label: "Segurança", value: categoryCounts.SEGURANCA ?? 0, color: "border-red-500", icon: Building2, iconCls: "text-red-400" },
          { label: "Limpeza", value: categoryCounts.LIMPEZA ?? 0, color: "border-sky-500", icon: Building2, iconCls: "text-sky-400" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`bg-slate-900 border border-slate-800 border-t-2 ${card.color} rounded-2xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.iconCls}`} />
              </div>
              <div className="text-2xl font-bold text-slate-100">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={filterSearch}
              onChange={(e) => { setFilterSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por nome, telefone, e-mail ou CNPJ..."
              className={`${inputCls} pl-9 w-full`}
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            className={selectCls}
          >
            <option value="">Todas as categorias</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards grid */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center py-16 text-slate-500">
            <Truck className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">Nenhum fornecedor encontrado</p>
            <p className="text-sm mt-1">Cadastre o primeiro fornecedor</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((f) => {
              const catCls = CATEGORY_COLORS[f.category ?? "OUTRO"] ?? CATEGORY_COLORS.OUTRO;
              return (
                <div
                  key={f.id}
                  className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-teal-300 font-bold text-sm">{initial(f.name)}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-slate-100 font-semibold text-sm truncate">{f.name}</h3>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${catCls}`}>
                        {CATEGORY_LABELS[f.category ?? "OUTRO"] ?? f.category}
                      </span>
                    </div>

                    {/* Actions - visible on hover */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(f)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(f)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{f.phone}</span>
                      {f.phone2 && <span className="text-slate-500">/ {f.phone2}</span>}
                    </div>
                    {f.email && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{f.email}</span>
                      </div>
                    )}
                    {f.department && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Hash className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate text-xs font-mono">{f.department}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 flex items-center justify-between">
          <span className="text-slate-500 text-sm">
            {list.length} de {total} fornecedores
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="flex items-center px-3 text-sm text-slate-400">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setDrawerOpen(false)} />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col">
            <div className="h-0.5 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500" />
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-slate-100 font-semibold">
                {editing ? "Editar Fornecedor" : "Novo Fornecedor"}
              </h2>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">{error}</div>
              )}

              <div>
                <p className="text-cyan-400 text-xs uppercase tracking-wider font-semibold mb-3">Dados da Empresa</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-xs mb-1.5">Razão Social / Nome *</label>
                    <input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: CleanTech Serviços Ltda"
                      className={`${inputCls} w-full`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 text-xs mb-1.5">Categoria *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className={`${selectCls} w-full`}
                      >
                        {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs mb-1.5">CNPJ / CPF</label>
                      <input
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="00.000.000/0000-00"
                        className={`${inputCls} w-full font-mono`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-cyan-400 text-xs uppercase tracking-wider font-semibold mb-3">Contato</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 text-xs mb-1.5">Telefone Principal *</label>
                      <input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(11) 99999-0000"
                        className={`${inputCls} w-full`}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs mb-1.5">Telefone Secundário</label>
                      <input
                        value={formData.phone2}
                        onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                        placeholder="(11) 3333-0000"
                        className={`${inputCls} w-full`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1.5">E-mail</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contato@empresa.com.br"
                      className={`${inputCls} w-full`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-cyan-400 text-xs uppercase tracking-wider font-semibold mb-3">Observações</p>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informações adicionais sobre o fornecedor..."
                  rows={4}
                  className={`${inputCls} w-full resize-none`}
                />
              </div>
            </form>

            <div className="px-6 py-4 border-t border-slate-800 flex gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="fornecedor-form"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e as any);
                }}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium text-sm hover:from-teal-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? "Atualizar" : "Cadastrar"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete modal */}
      {deleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setDeleteConfirm(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-slate-100 font-semibold">Excluir Fornecedor?</h3>
                    <p className="text-slate-500 text-sm">Esta ação não pode ser desfeita</p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-6">
                  Tem certeza que deseja excluir <strong className="text-slate-200">{deleteConfirm.name}</strong>?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-medium text-sm transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
