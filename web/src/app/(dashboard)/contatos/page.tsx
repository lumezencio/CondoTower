"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Phone,
  Mail,
  Building2,
  User,
  Users,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

type Contact = {
  id: string;
  name: string;
  type: "MORADOR" | "FUNCIONARIO" | "FORNECEDOR" | "EMERGENCIA" | "OUTRO";
  category: string | null;
  phone: string;
  phone2: string | null;
  email: string | null;
  department: string | null;
  notes: string | null;
  unit: { id: string; block: string; number: string } | null;
  createdAt: string;
};

type FormData = {
  name: string;
  type: "MORADOR" | "FUNCIONARIO" | "FORNECEDOR" | "EMERGENCIA" | "OUTRO";
  category: string;
  phone: string;
  phone2: string;
  email: string;
  department: string;
  notes: string;
};

const initialFormData: FormData = {
  name: "",
  type: "OUTRO",
  category: "",
  phone: "",
  phone2: "",
  email: "",
  department: "",
  notes: "",
};

const TYPE_LABELS: Record<string, string> = {
  MORADOR: "Morador",
  FUNCIONARIO: "Funcionário",
  FORNECEDOR: "Fornecedor",
  EMERGENCIA: "Emergência",
  OUTRO: "Outro",
};

const TYPE_BADGE: Record<string, string> = {
  MORADOR: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
  FUNCIONARIO: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  FORNECEDOR: "bg-teal-500/20 text-teal-300 border border-teal-500/30",
  EMERGENCIA: "bg-red-500/20 text-red-300 border border-red-500/30",
  OUTRO: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
};

const TYPE_AVATAR: Record<string, string> = {
  MORADOR: "bg-sky-500/20 text-sky-300",
  FUNCIONARIO: "bg-blue-500/20 text-blue-300",
  FORNECEDOR: "bg-teal-500/20 text-teal-300",
  EMERGENCIA: "bg-red-500/20 text-red-300",
  OUTRO: "bg-slate-500/20 text-slate-400",
};

const ALL_TYPES = ["MORADOR", "FUNCIONARIO", "FORNECEDOR", "EMERGENCIA", "OUTRO"] as const;

export default function ContatosPage() {
  const { push } = useToast();
  const [list, setList] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  const [filterType, setFilterType] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filterType.trim()) params.set("type", filterType.trim());
    if (filterSearch.trim()) params.set("search", filterSearch.trim());
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [filterType, filterSearch, page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/contacts?${queryString}`, { cache: "no-store" });
      const data = await response.json();
      if (data?.ok) {
        setList(data.data ?? []);
        setTotal(data.total ?? 0);
      } else {
        push({ title: "Erro", message: data?.message || "Falha ao carregar contatos", kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao carregar contatos:", err);
      push({ title: "Erro", message: "Falha de conexão ao carregar contatos", kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [queryString, push]);

  useEffect(() => {
    load();
  }, [load]);

  const [stats, setStats] = useState({ total: 0, MORADOR: 0, FUNCIONARIO: 0, FORNECEDOR: 0, EMERGENCIA: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/contacts?page=1&pageSize=9999", { cache: "no-store" });
        const data = await res.json();
        if (data?.ok) {
          const all: Contact[] = data.data ?? [];
          setStats({
            total: data.total ?? all.length,
            MORADOR: all.filter((c) => c.type === "MORADOR").length,
            FUNCIONARIO: all.filter((c) => c.type === "FUNCIONARIO").length,
            FORNECEDOR: all.filter((c) => c.type === "FORNECEDOR").length,
            EMERGENCIA: all.filter((c) => c.type === "EMERGENCIA").length,
          });
        }
      } catch {
        // silently fail stats
      }
    }
    loadStats();
  }, [list]);

  function openNewDrawer() {
    setIsDrawerOpen(true);
    setEditingContact(null);
    setFormData(initialFormData);
    setError("");
  }

  function openEditDrawer(contact: Contact) {
    setIsDrawerOpen(true);
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      type: contact.type,
      category: contact.category ?? "",
      phone: contact.phone,
      phone2: contact.phone2 ?? "",
      email: contact.email ?? "",
      department: contact.department ?? "",
      notes: contact.notes ?? "",
    });
    setError("");
  }

  function closeDrawer() {
    setIsDrawerOpen(false);
    setEditingContact(null);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Nome é obrigatório");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Telefone é obrigatório");
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: formData.name.trim(),
        type: formData.type,
        category: formData.category.trim() || null,
        phone: formData.phone.trim(),
        phone2: formData.phone2.trim() || null,
        email: formData.email.trim() || null,
        department: formData.department.trim() || null,
        notes: formData.notes.trim() || null,
      };

      const url = editingContact ? `/api/contacts/${editingContact.id}` : "/api/contacts";
      const method = editingContact ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.ok) {
        push({
          title: editingContact ? "Contato atualizado" : "Contato criado",
          message: `Contato ${editingContact ? "atualizado" : "criado"} com sucesso`,
          kind: "success",
        });
        closeDrawer();
        load();
      } else {
        setError(data.message || "Erro ao salvar contato");
        push({ title: "Erro", message: data.message || "Erro ao salvar contato", kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao salvar contato:", err);
      setError("Erro de conexão ao salvar contato");
      push({ title: "Erro", message: "Falha de conexão", kind: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/contacts/${deleteConfirm.id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.ok) {
        push({ title: "Contato excluído", message: "Contato excluído com sucesso", kind: "success" });
        load();
      } else {
        push({ title: "Erro", message: data.message || "Erro ao excluir contato", kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao excluir contato:", err);
      push({ title: "Erro", message: "Falha ao excluir contato", kind: "error" });
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  }

  const hasActiveFilters = filterSearch.trim() !== "" || filterType !== "";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Agenda de Contatos</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gerencie moradores, funcionários, fornecedores e contatos de emergência</p>
        </div>
        <button
          onClick={openNewDrawer}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-400 hover:to-green-400 text-white rounded-xl font-semibold shadow-lg shadow-lime-500/25 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Contato
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total */}
        <div className="bg-slate-900 border border-slate-800 border-t-2 border-t-lime-500 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-lime-500/15 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-lime-400" />
            </div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-0.5">contatos</p>
        </div>

        {/* Moradores */}
        <div className="bg-slate-900 border border-slate-800 border-t-2 border-t-sky-500 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/15 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Moradores</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{stats.MORADOR}</p>
          <p className="text-xs text-slate-500 mt-0.5">cadastrados</p>
        </div>

        {/* Funcionários */}
        <div className="bg-slate-900 border border-slate-800 border-t-2 border-t-blue-500 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Funcionários</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{stats.FUNCIONARIO}</p>
          <p className="text-xs text-slate-500 mt-0.5">cadastrados</p>
        </div>

        {/* Fornecedores */}
        <div className="bg-slate-900 border border-slate-800 border-t-2 border-t-teal-500 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-teal-500/15 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Fornecedores</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{stats.FORNECEDOR}</p>
          <p className="text-xs text-slate-500 mt-0.5">cadastrados</p>
        </div>

        {/* Emergências */}
        <div className="bg-slate-900 border border-slate-800 border-t-2 border-t-red-500 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
              <Phone className="w-3.5 h-3.5 text-red-400" />
            </div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Emergências</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{stats.EMERGENCIA}</p>
          <p className="text-xs text-slate-500 mt-0.5">cadastrados</p>
        </div>
      </div>

      {/* Filter Row: Type Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Type pill tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => { setFilterType(""); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterType === ""
                ? "bg-slate-700 text-white shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            Todos
          </button>
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => { setFilterType(t); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterType === t
                  ? "bg-slate-700 text-white shadow"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar contato..."
              value={filterSearch}
              onChange={(e) => { setFilterSearch(e.target.value); setPage(1); }}
              className="w-56 pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm transition-colors"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => { setFilterSearch(""); setFilterType(""); setPage(1); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-medium transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Contact Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            <span className="text-slate-400 text-sm">Carregando contatos...</span>
          </div>
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
            <BookOpen className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-slate-300 font-semibold">Nenhum contato encontrado</p>
          <p className="text-slate-500 text-sm mt-1">
            {hasActiveFilters ? "Tente ajustar os filtros de busca" : "Cadastre o primeiro contato do condomínio"}
          </p>
          {!hasActiveFilters && (
            <button
              onClick={openNewDrawer}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-lime-500 to-green-500 text-white rounded-xl text-sm font-semibold shadow shadow-lime-500/20 transition-all hover:from-lime-400 hover:to-green-400"
            >
              <Plus className="w-4 h-4" />
              Novo Contato
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((contact) => (
            <div
              key={contact.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition-all group flex flex-col"
            >
              {/* Card Top: Avatar + Name + Badge */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold flex-shrink-0 ${
                    TYPE_AVATAR[contact.type] || TYPE_AVATAR.OUTRO
                  }`}
                >
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-slate-100 font-semibold truncate leading-tight">{contact.name}</h3>
                  {contact.department && (
                    <p className="text-slate-400 text-sm truncate mt-0.5">{contact.department}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                        TYPE_BADGE[contact.type] || TYPE_BADGE.OUTRO
                      }`}
                    >
                      {TYPE_LABELS[contact.type] || contact.type}
                    </span>
                    {contact.category && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">
                        {contact.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-300 text-sm truncate">{contact.phone}</span>
                </div>
                {contact.phone2 && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-300 text-sm truncate">{contact.phone2}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-400 text-sm truncate">{contact.email}</span>
                  </div>
                )}
                {contact.unit && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-400 text-sm">
                      Bloco {contact.unit.block} — Unidade {contact.unit.number}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions — visible on hover */}
              <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditDrawer(contact)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => setDeleteConfirm(contact)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 rounded-lg text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-slate-500">
            Mostrando{" "}
            <span className="font-medium text-slate-300">{list.length}</span> de{" "}
            <span className="font-medium text-slate-300">{total}</span> contatos
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    pageNum === page
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Right-Side Drawer: Create / Edit */}
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={closeDrawer}
          />
          {/* Drawer Panel */}
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-slate-900 border-l border-slate-700 flex flex-col shadow-2xl">
            {/* Gradient accent line */}
            <div className="h-0.5 bg-gradient-to-r from-lime-500 via-green-400 to-lime-500 flex-shrink-0" />

            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center shadow shadow-lime-500/30">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">
                    {editingContact ? "Editar Contato" : "Novo Contato"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {editingContact ? "Atualize as informações abaixo" : "Preencha as informações do contato"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Section: Identificação */}
                <div>
                  <p className="text-cyan-400 text-xs uppercase tracking-wider font-semibold mb-3">Identificação</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        Nome <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-colors text-sm"
                        placeholder="Nome completo"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                          Tipo <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) =>
                            setFormData({ ...formData, type: e.target.value as FormData["type"] })
                          }
                          className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none appearance-none transition-colors cursor-pointer text-sm"
                        >
                          <option value="MORADOR">Morador</option>
                          <option value="FUNCIONARIO">Funcionário</option>
                          <option value="FORNECEDOR">Fornecedor</option>
                          <option value="EMERGENCIA">Emergência</option>
                          <option value="OUTRO">Outro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Categoria</label>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-colors text-sm"
                          placeholder="Ex: Síndico..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Departamento</label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-colors text-sm"
                        placeholder="Ex: Manutenção, Portaria..."
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Contato */}
                <div>
                  <p className="text-cyan-400 text-xs uppercase tracking-wider font-semibold mb-3">Contato</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        Telefone <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-colors text-sm"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Telefone 2</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={formData.phone2}
                          onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-colors text-sm"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-colors text-sm"
                          placeholder="email@exemplo.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Observações */}
                <div>
                  <p className="text-cyan-400 text-xs uppercase tracking-wider font-semibold mb-3">Observações</p>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none resize-none transition-colors text-sm"
                    placeholder="Informações adicionais sobre o contato..."
                  />
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 flex-shrink-0">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="px-4 py-2.5 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-400 hover:to-green-400 text-white rounded-xl font-semibold shadow shadow-lime-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Salvando..." : editingContact ? "Atualizar Contato" : "Criar Contato"}
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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Excluir Contato?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Esta ação não pode ser desfeita.</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 mb-6">
              Tem certeza que deseja excluir{" "}
              <span className="font-semibold text-slate-200">{deleteConfirm.name}</span>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
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
