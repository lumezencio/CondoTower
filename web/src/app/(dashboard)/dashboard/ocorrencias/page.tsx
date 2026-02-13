"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { BookOpenText, Plus, Search, Filter, Edit2, Trash2, X, ChevronLeft, ChevronRight, Loader2, Calendar, User, Flag, Clock, CheckCircle2, MapPin, Building2, Users } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type Ocorrencia = {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string;
  status: "ABERTA" | "EM_ANDAMENTO" | "RESOLVIDA" | "CANCELADA";
  prioridade: "BAIXA" | "MEDIA" | "ALTA" | "URGENTE";
  local: string;
  autor: string;
  dataAbertura: string;
  dataResolucao: string | null;
  responsavel: string | null;
  comentarios: number;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  tipo: string;
  titulo: string;
  descricao: string;
  prioridade: string;
  local: string;
  responsavel: string;
};

const initialFormData: FormData = {
  tipo: "MANUTENCAO",
  titulo: "",
  descricao: "",
  prioridade: "MEDIA",
  local: "",
  responsavel: "",
};

export default function OcorrenciasPage() {
  const { push } = useToast();
  const [list, setList] = useState<Ocorrencia[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Filtros
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterPrioridade, setFilterPrioridade] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOcorrencia, setEditingOcorrencia] = useState<Ocorrencia | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Ocorrencia | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filterStatus.trim()) params.set("status", filterStatus.trim());
    if (filterTipo.trim()) params.set("tipo", filterTipo.trim());
    if (filterPrioridade.trim()) params.set("prioridade", filterPrioridade.trim());
    if (filterSearch.trim()) params.set("search", filterSearch.trim());
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [filterStatus, filterTipo, filterPrioridade, filterSearch, page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Simulando chamada à API
      // const response = await fetch(`/api/ocorrencias?${queryString}`, { cache: "no-store" });
      // const data = await response.json();
      
      // Dados mockados para demonstração
      const mockData: Ocorrencia[] = [
        {
          id: "1",
          tipo: "MANUTENCAO",
          titulo: "Vazamento na cozinha do apto 302",
          descricao: "Detectado vazamento na torneira da cozinha, causando infiltração no teto do apartamento de baixo.",
          status: "EM_ANDAMENTO",
          prioridade: "ALTA",
          local: "Apto 302 - Bloco B",
          autor: "Maria Silva",
          dataAbertura: new Date().toISOString(),
          dataResolucao: null,
          responsavel: "Carlos Manutenções",
          comentarios: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          tipo: "SEGURANCA",
          titulo: "Portão automático com defeito",
          descricao: "Portão automático da entrada principal não está funcionando corretamente, dificultando a entrada e saída de veículos.",
          status: "ABERTA",
          prioridade: "URGENTE",
          local: "Portaria - Entrada Principal",
          autor: "José Porteiro",
          dataAbertura: new Date().toISOString(),
          dataResolucao: null,
          responsavel: null,
          comentarios: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          tipo: "LIMPEZA",
          titulo: "Necessidade de limpeza na academia",
          descricao: "Academia está acumulando lixo e precisa de limpeza completa, especialmente nos finais de semana.",
          status: "RESOLVIDA",
          prioridade: "MEDIA",
          local: "Academia - 2º Andar",
          autor: "Roberto Santos",
          dataAbertura: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
          dataResolucao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
          responsavel: "Equipe de Limpeza",
          comentarios: 5,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "4",
          tipo: "ELEVADOR",
          titulo: "Elevador do bloco A parado",
          descricao: "Elevador do bloco A está com pane elétrica e não está funcionando há 2 dias.",
          status: "ABERTA",
          prioridade: "URGENTE",
          local: "Elevador Social - Bloco A",
          autor: "Ana Claudia",
          dataAbertura: new Date().toISOString(),
          dataResolucao: null,
          responsavel: null,
          comentarios: 7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      
      // Simulando tempo de carregamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setList(mockData);
      setTotal(mockData.length);
    } catch (err) {
      console.error("Erro ao carregar ocorrências:", err);
      push({ title: "Erro", message: "Falha de conexão ao carregar ocorrências", kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [queryString, push]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (ocorrencia?: Ocorrencia) => {
    if (ocorrencia) {
      setEditingOcorrencia(ocorrencia);
      setFormData({
        tipo: ocorrencia.tipo,
        titulo: ocorrencia.titulo,
        descricao: ocorrencia.descricao,
        prioridade: ocorrencia.prioridade,
        local: ocorrencia.local,
        responsavel: ocorrencia.responsavel || "",
      });
    } else {
      setEditingOcorrencia(null);
      setFormData(initialFormData);
    }
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOcorrencia(null);
    setFormData(initialFormData);
    setError("");
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.descricao.trim() || !formData.local.trim()) {
      setError("Título, descrição e local são obrigatórios.");
      return;
    }

    const payload = {
      ...formData,
      titulo: formData.titulo.trim(),
      descricao: formData.descricao.trim(),
      local: formData.local.trim(),
    };

    setSaving(true);
    setError("");

    try {
      // Simulando chamada à API
      // const url = editingOcorrencia ? `/api/ocorrencias/${editingOcorrencia.id}` : "/api/ocorrencias";
      // const method = editingOcorrencia ? "PUT" : "POST";

      // const response = await fetch(url, {
      //   method,
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });

      // const data = await response.json();

      // Simulando resposta positiva
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (true) { // Simulando sucesso
        closeModal();
        await load();
        push({ 
          title: editingOcorrencia ? "Ocorrência atualizada!" : "Ocorrência criada!", 
          message: `A ocorrência "${payload.titulo}" foi ${editingOcorrencia ? 'atualizada' : 'criada'} com sucesso.`,
          kind: "success" 
        });
      } else {
        setError("Erro ao salvar ocorrência.");
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
      // Simulando chamada à API
      // const response = await fetch(`/api/ocorrencias/${deleteConfirm.id}`, {
      //   method: "DELETE",
      // });

      // const data = await response.json();

      // Simulando resposta positiva
      await new Promise(resolve => setTimeout(resolve, 600));
      
      if (true) { // Simulando sucesso
        setDeleteConfirm(null);
        await load();
        push({ 
          title: "Ocorrência excluída!", 
          message: `A ocorrência "${deleteConfirm.titulo}" foi excluída com sucesso.`,
          kind: "success" 
        });
      } else {
        push({ title: "Erro", message: "Erro ao excluir ocorrência.", kind: "error" });
      }
    } catch (err) {
      push({ title: "Erro", message: "Falha de conexão ao excluir ocorrência.", kind: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterTipo("");
    setFilterPrioridade("");
    setFilterSearch("");
    setPage(1);
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVIDA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">Resolvida</span>;
      case "EM_ANDAMENTO":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">Em Andamento</span>;
      case "CANCELADA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300">Cancelada</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300">Aberta</span>;
    }
  };

  // Priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENTE":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300">Urgente</span>;
      case "ALTA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300">Alta</span>;
      case "MEDIA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">Média</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300">Baixa</span>;
    }
  };

  // Type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "MANUTENCAO":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300">Manutenção</span>;
      case "SEGURANCA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300">Segurança</span>;
      case "LIMPEZA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">Limpeza</span>;
      case "VIZINHANCA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">Vizinhança</span>;
      case "ELEVADOR":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300">Elevador</span>;
      case "PISCINA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300">Piscina</span>;
      case "BARULHO":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-500/20 text-pink-300">Barulho</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300">Outro</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BookOpenText className="w-7 h-7 text-amber-400" />
            Livro de Ocorrências
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie as ocorrências e problemas do condomínio
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-amber-500/25"
        >
          <Plus className="w-5 h-5" />
          Nova Ocorrência
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
                placeholder="Título ou descrição..."
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
              <option value="ABERTA">Aberta</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="RESOLVIDA">Resolvida</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tipo</label>
            <select 
              value={filterTipo}
              onChange={(e) => { setFilterTipo(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
            >
              <option value="">Todos</option>
              <option value="MANUTENCAO">Manutenção</option>
              <option value="SEGURANCA">Segurança</option>
              <option value="LIMPEZA">Limpeza</option>
              <option value="VIZINHANCA">Vizinhança</option>
              <option value="ELEVADOR">Elevador</option>
              <option value="PISCINA">Piscina</option>
              <option value="BARULHO">Barulho</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Prioridade</label>
            <select 
              value={filterPrioridade}
              onChange={(e) => { setFilterPrioridade(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
            >
              <option value="">Todas</option>
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left py-3 px-4 font-medium text-slate-300">Título</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Tipo</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Prioridade</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Local</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Autor</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Data</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300 w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                      Carregando ocorrências...
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <BookOpenText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    Nenhuma ocorrência encontrada.
                  </td>
                </tr>
              ) : (
                list.map((ocorrencia) => (
                  <tr
                    key={ocorrencia.id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{ocorrencia.titulo}</div>
                      <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {ocorrencia.descricao.substring(0, 60)}...
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Flag className="w-3 h-3" />
                          {ocorrencia.comentarios} comentário{ocorrencia.comentarios !== 1 ? 's' : ''}
                        </div>
                        {ocorrencia.responsavel && (
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {ocorrencia.responsavel}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getTypeBadge(ocorrencia.tipo)}
                    </td>
                    <td className="py-3 px-4">
                      {getPriorityBadge(ocorrencia.prioridade)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(ocorrencia.status)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {ocorrencia.local}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {ocorrencia.autor}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {formatDate(ocorrencia.dataAbertura)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openModal(ocorrencia)}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(ocorrencia)}
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
              Mostrando {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} de {total} ocorrências
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
                <BookOpenText className="w-5 h-5 text-amber-400" />
                {editingOcorrencia ? "Editar Ocorrência" : "Nova Ocorrência"}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Tipo <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => handleInputChange("tipo", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                  >
                    <option value="MANUTENCAO">Manutenção</option>
                    <option value="SEGURANCA">Segurança</option>
                    <option value="LIMPEZA">Limpeza</option>
                    <option value="VIZINHANCA">Vizinhança</option>
                    <option value="ELEVADOR">Elevador</option>
                    <option value="PISCINA">Piscina</option>
                    <option value="BARULHO">Barulho</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Prioridade <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={formData.prioridade}
                    onChange={(e) => handleInputChange("prioridade", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                  >
                    <option value="BAIXA">Baixa</option>
                    <option value="MEDIA">Média</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Título <span className="text-amber-400">*</span>
                  </label>
                  <input
                    value={formData.titulo}
                    onChange={(e) => handleInputChange("titulo", e.target.value)}
                    placeholder="Título da ocorrência"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                    autoFocus
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Descrição <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => handleInputChange("descricao", e.target.value)}
                    placeholder="Descreva a ocorrência com detalhes..."
                    rows={4}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition resize-none"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Local <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      value={formData.local}
                      onChange={(e) => handleInputChange("local", e.target.value)}
                      placeholder="Ex: Apto 302 - Bloco B ou Salão de Festas"
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Responsável (opcional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      value={formData.responsavel}
                      onChange={(e) => handleInputChange("responsavel", e.target.value)}
                      placeholder="Nome do responsável pela resolução"
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                    />
                  </div>
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
                      <>{editingOcorrencia ? "Salvar Alterações" : "Registrar Ocorrência"}</>
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
                Excluir Ocorrência?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Deseja realmente excluir a ocorrência{" "}
                <span className="text-white font-medium">
                  "{deleteConfirm.titulo}"
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