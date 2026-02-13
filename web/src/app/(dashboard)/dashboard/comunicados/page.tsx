"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Megaphone, Plus, Search, Filter, Edit2, Trash2, X, ChevronLeft, ChevronRight, Loader2, Calendar, User, Users, Building2, Eye, Send, Archive, Pin } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type Communicado = {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: "BAIXA" | "NORMAL" | "ALTA" | "URGENTE";
  fixed: boolean;
  attachments: string[];
  author: string;
  publicationDate: string;
  targetAudience: string; // "TODOS", "BLOCO_A", "UNIDADE_101", etc
  readCount: number;
  totalRecipients: number;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  title: string;
  content: string;
  type: string;
  priority: string;
  fixed: boolean;
  targetAudience: string;
  attachments: string[];
};

const initialFormData: FormData = {
  title: "",
  content: "",
  type: "AVISO_GERAL",
  priority: "NORMAL",
  fixed: false,
  targetAudience: "TODOS",
  attachments: [],
};

export default function ComunicadosPage() {
  const { push } = useToast();
  const [list, setList] = useState<Communicado[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Filtros
  const [filterType, setFilterType] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterFixed, setFilterFixed] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComunicado, setEditingComunicado] = useState<Communicado | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Communicado | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filterType.trim()) params.set("type", filterType.trim());
    if (filterPriority.trim()) params.set("priority", filterPriority.trim());
    if (filterFixed.trim()) params.set("fixed", filterFixed.trim());
    if (filterSearch.trim()) params.set("search", filterSearch.trim());
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [filterType, filterPriority, filterFixed, filterSearch, page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Simulando chamada à API
      // const response = await fetch(`/api/communicados?${queryString}`, { cache: "no-store" });
      // const data = await response.json();
      
      // Dados mockados para demonstração
      const mockData: Communicado[] = [
        {
          id: "1",
          title: "Manutenção preventiva no elevador",
          content: "Informamos que haverá manutenção preventiva no elevador do bloco A no sábado, das 8h às 12h.",
          type: "MANUTENCAO",
          priority: "ALTA",
          fixed: true,
          attachments: [],
          author: "Síndico",
          publicationDate: new Date().toISOString(),
          targetAudience: "TODOS",
          readCount: 42,
          totalRecipients: 48,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Assembleia extraordinária",
          content: "Convocamos todos os condôminos para a assembleia extraordinária no dia 20/02/2026 às 19h.",
          type: "ASSEMBLEIA",
          priority: "URGENTE",
          fixed: true,
          attachments: ["/docs/convocacao.pdf"],
          author: "Síndico",
          publicationDate: new Date().toISOString(),
          targetAudience: "TODOS",
          readCount: 38,
          totalRecipients: 48,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          title: "Festa junina no salão de festas",
          content: "Será realizada festa junina no próximo sábado, das 15h às 22h. Trazer ingredientes conforme lista divulgada.",
          type: "EVENTO",
          priority: "NORMAL",
          fixed: false,
          attachments: [],
          author: "Comissão de Eventos",
          publicationDate: new Date().toISOString(),
          targetAudience: "TODOS",
          readCount: 25,
          totalRecipients: 48,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      
      // Simulando tempo de carregamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setList(mockData);
      setTotal(mockData.length);
    } catch (err) {
      console.error("Erro ao carregar comunicados:", err);
      push({ title: "Erro", message: "Falha de conexão ao carregar comunicados", kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [queryString, push]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (comunicado?: Communicado) => {
    if (comunicado) {
      setEditingComunicado(comunicado);
      setFormData({
        title: comunicado.title,
        content: comunicado.content,
        type: comunicado.type,
        priority: comunicado.priority,
        fixed: comunicado.fixed,
        targetAudience: comunicado.targetAudience,
        attachments: comunicado.attachments,
      });
    } else {
      setEditingComunicado(null);
      setFormData(initialFormData);
    }
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingComunicado(null);
    setFormData(initialFormData);
    setError("");
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleAddAttachment = () => {
    const url = prompt("Informe a URL do anexo:");
    if (url) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, url]
      }));
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => {
      const newAttachments = [...prev.attachments];
      newAttachments.splice(index, 1);
      return { ...prev, attachments: newAttachments };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Título e conteúdo são obrigatórios.");
      return;
    }

    const payload = {
      ...formData,
      title: formData.title.trim(),
      content: formData.content.trim(),
    };

    setSaving(true);
    setError("");

    try {
      // Simulando chamada à API
      // const url = editingComunicado ? `/api/communicados/${editingComunicado.id}` : "/api/communicados";
      // const method = editingComunicado ? "PUT" : "POST";

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
          title: editingComunicado ? "Comunicado atualizado!" : "Comunicado criado!", 
          message: `O comunicado "${payload.title}" foi ${editingComunicado ? 'atualizado' : 'criado'} com sucesso.`,
          kind: "success" 
        });
      } else {
        setError("Erro ao salvar comunicado.");
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
      // const response = await fetch(`/api/communicados/${deleteConfirm.id}`, {
      //   method: "DELETE",
      // });

      // const data = await response.json();

      // Simulando resposta positiva
      await new Promise(resolve => setTimeout(resolve, 600));
      
      if (true) { // Simulando sucesso
        setDeleteConfirm(null);
        await load();
        push({ 
          title: "Comunicado excluído!", 
          message: `O comunicado "${deleteConfirm.title}" foi excluído com sucesso.`,
          kind: "success" 
        });
      } else {
        push({ title: "Erro", message: "Erro ao excluir comunicado.", kind: "error" });
      }
    } catch (err) {
      push({ title: "Erro", message: "Falha de conexão ao excluir comunicado.", kind: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterType("");
    setFilterPriority("");
    setFilterFixed("");
    setFilterSearch("");
    setPage(1);
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENTE":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300">Urgente</span>;
      case "ALTA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300">Alta</span>;
      case "NORMAL":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">Normal</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300">Baixa</span>;
    }
  };

  // Type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "AVISO_GERAL":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300">Aviso Geral</span>;
      case "MANUTENCAO":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300">Manutenção</span>;
      case "ASSEMBLEIA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">Assembleia</span>;
      case "EVENTO":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">Evento</span>;
      case "SEGURANCA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300">Segurança</span>;
      case "REGRA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300">Regra</span>;
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
            <Megaphone className="w-7 h-7 text-indigo-400" />
            Comunicados
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie os comunicados e avisos do condomínio
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-5 h-5" />
          Novo Comunicado
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
                placeholder="Título ou conteúdo..."
                className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tipo</label>
            <select 
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            >
              <option value="">Todos</option>
              <option value="AVISO_GERAL">Aviso Geral</option>
              <option value="MANUTENCAO">Manutenção</option>
              <option value="ASSEMBLEIA">Assembleia</option>
              <option value="EVENTO">Evento</option>
              <option value="SEGURANCA">Segurança</option>
              <option value="REGRA">Regra</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Prioridade</label>
            <select 
              value={filterPriority}
              onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            >
              <option value="">Todas</option>
              <option value="BAIXA">Baixa</option>
              <option value="NORMAL">Normal</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Fixado</label>
            <select 
              value={filterFixed}
              onChange={(e) => { setFilterFixed(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            >
              <option value="">Todos</option>
              <option value="true">Sim</option>
              <option value="false">Não</option>
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
                <th className="text-center py-3 px-4 font-medium text-slate-300">Fixado</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300">Visualizações</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Data</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300 w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                      Carregando comunicados...
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    Nenhum comunicado encontrado.
                  </td>
                </tr>
              ) : (
                list.map((comunicado) => (
                  <tr
                    key={comunicado.id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200 flex items-center gap-2">
                        {comunicado.title}
                        {comunicado.fixed && (
                          <Pin className="w-4 h-4 text-amber-400" title="Fixado" />
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {comunicado.content.substring(0, 60)}...
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getTypeBadge(comunicado.type)}
                    </td>
                    <td className="py-3 px-4">
                      {getPriorityBadge(comunicado.priority)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {comunicado.fixed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300">
                          Sim
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300">
                          Não
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">
                          {comunicado.readCount}/{comunicado.totalRecipients}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {formatDate(comunicado.publicationDate)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openModal(comunicado)}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(comunicado)}
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
              Mostrando {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} de {total} comunicados
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
                        ? "bg-indigo-600 text-white"
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
          <div className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-400" />
                {editingComunicado ? "Editar Comunicado" : "Novo Comunicado"}
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
                    Tipo <span className="text-indigo-400">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  >
                    <option value="AVISO_GERAL">Aviso Geral</option>
                    <option value="MANUTENCAO">Manutenção</option>
                    <option value="ASSEMBLEIA">Assembleia</option>
                    <option value="EVENTO">Evento</option>
                    <option value="SEGURANCA">Segurança</option>
                    <option value="REGRA">Regra</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Prioridade <span className="text-indigo-400">*</span>
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange("priority", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  >
                    <option value="BAIXA">Baixa</option>
                    <option value="NORMAL">Normal</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Público-alvo
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  >
                    <option value="TODOS">Todos os condôminos</option>
                    <option value="BLOCO_A">Bloco A</option>
                    <option value="BLOCO_B">Bloco B</option>
                    <option value="AREA_COMUM">Área de uso comum</option>
                    <option value="SINDICO">Apenas síndico</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.fixed}
                      onChange={(e) => handleInputChange("fixed", e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <span className="ml-2 text-sm text-slate-300">Fixar comunicado</span>
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="text-xs text-slate-400 mb-1 block">
                  Título <span className="text-indigo-400">*</span>
                </label>
                <input
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Título do comunicado"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  autoFocus
                />
              </div>
              
              <div className="mb-4">
                <label className="text-xs text-slate-400 mb-1 block">
                  Conteúdo <span className="text-indigo-400">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  placeholder="Conteúdo do comunicado..."
                  rows={5}
                  className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
                />
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-400">Anexos</label>
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Adicionar
                  </button>
                </div>
                
                {formData.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {formData.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2 truncate">
                          <Paperclip className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="text-sm text-slate-300 truncate">{attachment}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="text-slate-400 hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic py-2 text-center">
                    Nenhum anexo adicionado
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <div className="text-sm text-slate-400">
                  <p>Campos marcados com <span className="text-indigo-400">*</span> são obrigatórios</p>
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
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>{editingComunicado ? "Salvar Alterações" : "Publicar Comunicado"}</>
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
                Excluir Comunicado?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Deseja realmente excluir o comunicado{" "}
                <span className="text-white font-medium">
                  "{deleteConfirm.title}"
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

// Importar o ícone de clipe de papel
import { Paperclip } from "lucide-react";