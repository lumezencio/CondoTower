"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clock,
  CheckCircle2,
  MapPin,
  User,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

type AreaComum = {
  id: string;
  nome: string;
  tipo: string;
  capacidade: number | null;
  valorReserva: number | null;
  requerAprovacao: boolean;
  ativo: boolean;
};

type Evento = {
  id: string;
  titulo: string;
  descricao: string | null;
  dataInicio: string;
  dataFim: string;
  status: "PENDENTE" | "APROVADO" | "REJEITADO" | "CANCELADO" | "CONCLUIDO";
  valor: number | null;
  nomeResponsavel: string | null;
  telefoneResponsavel: string | null;
  motivoRejeicao: string | null;
  areaComum: { id: string; nome: string; tipo: string };
  unit: { id: string; block: string; number: string } | null;
  createdAt: string;
};

type FormData = {
  areaComumId: string;
  titulo: string;
  dataInicio: string;
  dataFim: string;
  nomeResponsavel: string;
  telefoneResponsavel: string;
  descricao: string;
  observacoes: string;
  valor: string;
  status: string;
  motivoRejeicao: string;
};

const initialFormData: FormData = {
  areaComumId: "",
  titulo: "",
  dataInicio: "",
  dataFim: "",
  nomeResponsavel: "",
  telefoneResponsavel: "",
  descricao: "",
  observacoes: "",
  valor: "",
  status: "PENDENTE",
  motivoRejeicao: "",
};

const areaTipoLabels: Record<string, string> = {
  SALAO_FESTAS: "Salão de Festas",
  CHURRASQUEIRA: "Churrasqueira",
  PISCINA: "Piscina",
  ACADEMIA: "Academia",
  QUADRA: "Quadra",
  PLAYGROUND: "Playground",
  ESPACO_GOURMET: "Espaço Gourmet",
  SALA_REUNIAO: "Sala de Reunião",
  OUTRO: "Outro",
};

const statusOptions = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "APROVADO", label: "Aprovado" },
  { value: "REJEITADO", label: "Rejeitado" },
  { value: "CANCELADO", label: "Cancelado" },
  { value: "CONCLUIDO", label: "Concluído" },
];

export default function EventosPage() {
  const { push } = useToast();
  const [list, setList] = useState<Evento[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [areas, setAreas] = useState<AreaComum[]>([]);

  // Filtros
  const [filterStatus, setFilterStatus] = useState("");
  const [filterAreaComumId, setFilterAreaComumId] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Evento | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  // Load areas comuns on mount
  useEffect(() => {
    fetch("/api/areas-comuns")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setAreas(d.data);
      });
  }, []);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filterStatus.trim()) params.set("status", filterStatus.trim());
    if (filterAreaComumId.trim()) params.set("areaComumId", filterAreaComumId.trim());
    if (filterSearch.trim()) params.set("search", filterSearch.trim());
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [filterStatus, filterAreaComumId, filterSearch, page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/eventos?${queryString}`, { cache: "no-store" });
      const data = await response.json();
      if (data?.ok) {
        setList(data.data ?? []);
        setTotal(data.total ?? 0);
      } else {
        push({ title: "Erro", message: data?.message || "Falha ao carregar eventos", kind: "error" });
      }
    } catch (err) {
      console.error("Erro ao carregar eventos:", err);
      push({ title: "Erro", message: "Falha de conexão ao carregar eventos", kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [queryString, push]);

  useEffect(() => {
    load();
  }, [load]);

  // Stats
  const totalReservas = total;
  const pendentes = list.filter((e) => e.status === "PENDENTE").length;
  const aprovadas = list.filter((e) => e.status === "APROVADO").length;
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const esteMes = list.filter((e) => new Date(e.createdAt) >= startOfMonth).length;

  const openModal = (evento?: Evento) => {
    if (evento) {
      setEditingEvento(evento);
      setFormData({
        areaComumId: evento.areaComum.id,
        titulo: evento.titulo,
        dataInicio: evento.dataInicio.slice(0, 16),
        dataFim: evento.dataFim.slice(0, 16),
        nomeResponsavel: evento.nomeResponsavel || "",
        telefoneResponsavel: evento.telefoneResponsavel || "",
        descricao: evento.descricao || "",
        observacoes: "",
        valor: evento.valor != null ? String(evento.valor) : "",
        status: evento.status,
        motivoRejeicao: evento.motivoRejeicao || "",
      });
    } else {
      setEditingEvento(null);
      setFormData(initialFormData);
    }
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvento(null);
    setFormData(initialFormData);
    setError("");
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-fill valor from selected area
      if (field === "areaComumId") {
        const area = areas.find((a) => a.id === value);
        if (area && area.valorReserva != null) {
          next.valor = String(area.valorReserva);
        } else {
          next.valor = "";
        }
      }
      return next;
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.areaComumId.trim() || !formData.titulo.trim() || !formData.dataInicio.trim() || !formData.dataFim.trim()) {
      setError("Área comum, título, data de início e data de fim são obrigatórios.");
      return;
    }

    if (new Date(formData.dataFim) <= new Date(formData.dataInicio)) {
      setError("A data de fim deve ser posterior à data de início.");
      return;
    }

    const payload: Record<string, unknown> = {
      areaComumId: formData.areaComumId,
      titulo: formData.titulo.trim(),
      dataInicio: formData.dataInicio,
      dataFim: formData.dataFim,
      nomeResponsavel: formData.nomeResponsavel.trim() || null,
      telefoneResponsavel: formData.telefoneResponsavel.trim() || null,
      descricao: formData.descricao.trim() || null,
      observacoes: formData.observacoes.trim() || null,
      valor: formData.valor !== "" ? parseFloat(formData.valor) : null,
    };

    if (editingEvento) {
      payload.status = formData.status;
      if (formData.status === "REJEITADO") {
        payload.motivoRejeicao = formData.motivoRejeicao.trim() || null;
      }
    }

    setSaving(true);
    setError("");

    try {
      const url = editingEvento ? `/api/eventos/${editingEvento.id}` : "/api/eventos";
      const method = editingEvento ? "PUT" : "POST";

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
          title: editingEvento ? "Reserva atualizada!" : "Reserva criada!",
          message: `A reserva "${formData.titulo}" foi ${editingEvento ? "atualizada" : "criada"} com sucesso.`,
          kind: "success",
        });
      } else {
        setError(data?.message ?? "Erro ao salvar reserva.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/eventos/${deleteConfirm.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data?.ok) {
        setDeleteConfirm(null);
        await load();
        push({
          title: "Reserva excluída!",
          message: `A reserva "${deleteConfirm.titulo}" foi excluída com sucesso.`,
          kind: "success",
        });
      } else {
        push({ title: "Erro", message: data?.message ?? "Erro ao excluir reserva.", kind: "error" });
      }
    } catch {
      push({ title: "Erro", message: "Falha de conexão ao excluir reserva.", kind: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterAreaComumId("");
    setFilterSearch("");
    setPage(1);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${dd}/${mm} ${hh}:${min}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APROVADO":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">
            Aprovado
          </span>
        );
      case "REJEITADO":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300">
            Rejeitado
          </span>
        );
      case "CANCELADO":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300">
            Cancelado
          </span>
        );
      case "CONCLUIDO":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
            Concluído
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300">
            Pendente
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CalendarDays className="w-7 h-7 text-cyan-400" />
            Eventos e Reservas
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie reservas de áreas comuns e eventos do condomínio
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-cyan-500/25"
        >
          <Plus className="w-5 h-5" />
          Nova Reserva
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Reservas</p>
            <p className="text-2xl font-bold text-white">{totalReservas}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Pendentes aprovação</p>
            <p className="text-2xl font-bold text-white">{pendentes}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Aprovadas</p>
            <p className="text-2xl font-bold text-white">{aprovadas}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Este mês</p>
            <p className="text-2xl font-bold text-white">{esteMes}</p>
          </div>
        </div>
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
                placeholder="Título, responsável..."
                className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
            >
              <option value="">Todos</option>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Área Comum</label>
            <select
              value={filterAreaComumId}
              onChange={(e) => { setFilterAreaComumId(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
            >
              <option value="">Todas</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
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
                <th className="text-left py-3 px-4 font-medium text-slate-300">Área</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Evento</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Data/Hora</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300">Status</th>
                <th className="text-right py-3 px-4 font-medium text-slate-300">Valor</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300 w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
                      Carregando reservas...
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    Nenhuma reserva encontrada.
                  </td>
                </tr>
              ) : (
                list.map((evento) => (
                  <tr key={evento.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-slate-200">{evento.areaComum.nome}</div>
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-xs mt-0.5">
                            {areaTipoLabels[evento.areaComum.tipo] ?? evento.areaComum.tipo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{evento.titulo}</div>
                      {evento.nomeResponsavel && (
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <User className="w-3 h-3" />
                          {evento.nomeResponsavel}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-medium">{formatDateTime(evento.dataInicio)}</div>
                      <div className="text-slate-400 text-xs mt-0.5">até {formatDateTime(evento.dataFim)}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(evento.status)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-200 font-medium">
                      {evento.valor != null ? formatCurrency(evento.valor) : <span className="text-slate-500">—</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openModal(evento)}
                          className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(evento)}
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
              Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total} reservas
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                        ? "bg-cyan-600 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
                <CalendarDays className="w-5 h-5 text-cyan-400" />
                {editingEvento ? "Editar Reserva" : "Nova Reserva"}
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
                {/* Área Comum */}
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Área Comum <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.areaComumId}
                    onChange={(e) => handleInputChange("areaComumId", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                    autoFocus
                  >
                    <option value="">Selecione uma área...</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nome} — {areaTipoLabels[a.tipo] ?? a.tipo}
                        {a.valorReserva != null ? ` (${formatCurrency(a.valorReserva)})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Título */}
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Título do Evento <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={formData.titulo}
                    onChange={(e) => handleInputChange("titulo", e.target.value)}
                    placeholder="Ex: Festa de aniversário"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                  />
                </div>

                {/* Data Início */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Data/Hora de Início <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dataInicio}
                    onChange={(e) => handleInputChange("dataInicio", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                  />
                </div>

                {/* Data Fim */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Data/Hora de Fim <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dataFim}
                    onChange={(e) => handleInputChange("dataFim", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                  />
                </div>

                {/* Nome Responsável */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Nome do Responsável</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      value={formData.nomeResponsavel}
                      onChange={(e) => handleInputChange("nomeResponsavel", e.target.value)}
                      placeholder="Nome completo"
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                    />
                  </div>
                </div>

                {/* Telefone Responsável */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Telefone do Responsável</label>
                  <input
                    value={formData.telefoneResponsavel}
                    onChange={(e) => handleInputChange("telefoneResponsavel", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                  />
                </div>

                {/* Descrição */}
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">Descrição</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => handleInputChange("descricao", e.target.value)}
                    placeholder="Descreva o evento..."
                    rows={2}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition resize-none"
                  />
                </div>

                {/* Observações */}
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">Observações</label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange("observacoes", e.target.value)}
                    placeholder="Informações adicionais..."
                    rows={2}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition resize-none"
                  />
                </div>

                {/* Valor */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Valor{" "}
                    <span className="text-slate-500">(preenchido automaticamente pela área)</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.valor}
                      onChange={(e) => handleInputChange("valor", e.target.value)}
                      placeholder="0,00"
                      disabled
                      className="w-full rounded-lg border border-white/10 bg-slate-800/50 text-slate-400 placeholder-slate-600 pl-10 pr-3 py-2.5 outline-none transition cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Status (edit only) */}
                {editingEvento && (
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                    >
                      {statusOptions.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Motivo Rejeição (shows when status = REJEITADO) */}
                {editingEvento && formData.status === "REJEITADO" && (
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-400 mb-1 block">Motivo da Rejeição</label>
                    <textarea
                      value={formData.motivoRejeicao}
                      onChange={(e) => handleInputChange("motivoRejeicao", e.target.value)}
                      placeholder="Informe o motivo da rejeição..."
                      rows={2}
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition resize-none"
                    />
                  </div>
                )}
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
                  className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>{editingEvento ? "Salvar Alterações" : "Cadastrar Reserva"}</>
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
              <h3 className="text-lg font-semibold text-white mb-2">Excluir Reserva?</h3>
              <p className="text-slate-400 text-sm mb-6">
                Deseja realmente excluir a reserva{" "}
                <span className="text-white font-medium">"{deleteConfirm.titulo}"</span>? Esta ação
                não pode ser desfeita.
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
