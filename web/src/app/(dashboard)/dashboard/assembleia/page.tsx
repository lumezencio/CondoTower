"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Users, Plus, Search, Filter, Edit2, Trash2, X, ChevronLeft, ChevronRight, Loader2, Calendar, Clock, MapPin, FileText, Vote, CheckCircle2, XCircle, BarChart3, Send } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type Assembleia = {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string;
  dataAssembleia: string;
  local: string;
  pauta: string;
  quorumMinimo: number; // percentual
  status: "CONVOCADA" | "EM_ANDAMENTO" | "CONCLUIDA" | "CANCELADA";
  ataUrl: string | null;
  votos: Voto[];
  createdAt: string;
  updatedAt: string;
};

type Voto = {
  id: string;
  assembleiaId: string;
  userId: string;
  voto: string; // "SIM", "NAO", "ABSTENCAO"
  createdAt: string;
};

type FormData = {
  tipo: string;
  titulo: string;
  descricao: string;
  dataAssembleia: string;
  local: string;
  pauta: string;
  quorumMinimo: string;
};

const initialFormData: FormData = {
  tipo: "ORDINARIA",
  titulo: "",
  descricao: "",
  dataAssembleia: "",
  local: "",
  pauta: "",
  quorumMinimo: "50",
};

export default function AssembleiasPage() {
  const { push } = useToast();
  const [list, setList] = useState<Assembleia[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Filtros
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssembleia, setEditingAssembleia] = useState<Assembleia | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Assembleia | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filterStatus.trim()) params.set("status", filterStatus.trim());
    if (filterTipo.trim()) params.set("tipo", filterTipo.trim());
    if (filterSearch.trim()) params.set("search", filterSearch.trim());
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [filterStatus, filterTipo, filterSearch, page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Simulando chamada à API
      // const response = await fetch(`/api/assembleias?${queryString}`, { cache: "no-store" });
      // const data = await response.json();
      
      // Dados mockados para demonstração
      const mockData: Assembleia[] = [
        {
          id: "1",
          tipo: "ORDINARIA",
          titulo: "Assembleia Ordinária - Aprovação do Orçamento 2026",
          descricao: "Discussão e votação do orçamento anual do condomínio para o ano de 2026",
          dataAssembleia: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(), // Daqui a 15 dias
          local: "Auditório do Condomínio",
          pauta: "1. Leitura do balanço patrimonial\n2. Discussão do orçamento anual\n3. Aprovação de eventuais aumentos de taxas\n4. Eleição do novo conselho fiscal",
          quorumMinimo: 50,
          status: "CONVOCADA",
          ataUrl: null,
          votos: [],
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias atrás
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          tipo: "EXTRAORDINARIA",
          titulo: "Assembleia Extraordinária - Reforma da Piscina",
          descricao: "Decisão sobre a reforma completa da piscina do condomínio",
          dataAssembleia: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
          local: "Salão de Festas",
          pauta: "1. Apresentação do projeto de reforma\n2. Discussão do orçamento\n3. Votação para aprovação",
          quorumMinimo: 66,
          status: "CONCLUIDA",
          ataUrl: "/atas/assembleia_reforma_piscina.pdf",
          votos: [
            { id: "v1", assembleiaId: "2", userId: "u1", voto: "SIM", createdAt: new Date().toISOString() },
            { id: "v2", assembleiaId: "2", userId: "u2", voto: "SIM", createdAt: new Date().toISOString() },
            { id: "v3", assembleiaId: "2", userId: "u3", voto: "NAO", createdAt: new Date().toISOString() },
          ],
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 dias atrás
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
        },
        {
          id: "3",
          tipo: "ORDINARIA",
          titulo: "Assembleia Ordinária - Prestação de Contas",
          descricao: "Apresentação e aprovação da prestação de contas do exercício anterior",
          dataAssembleia: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias atrás
          local: "Sala de Reuniões",
          pauta: "1. Apresentação do balanço financeiro\n2. Demonstração de despesas\n3. Aprovação da prestação de contas",
          quorumMinimo: 50,
          status: "CONCLUIDA",
          ataUrl: "/atas/assembleia_prestacao_contas.pdf",
          votos: [
            { id: "v4", assembleiaId: "3", userId: "u4", voto: "SIM", createdAt: new Date().toISOString() },
            { id: "v5", assembleiaId: "3", userId: "u5", voto: "SIM", createdAt: new Date().toISOString() },
          ],
          createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 dias atrás
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias atrás
        },
        {
          id: "4",
          tipo: "EXTRAORDINARIA",
          titulo: "Assembleia Extraordinária - Regimento Interno",
          descricao: "Revisão e aprovação de alterações no regimento interno",
          dataAssembleia: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(), // Daqui a 30 dias
          local: "Auditório do Condomínio",
          pauta: "1. Leitura das propostas de alteração\n2. Discussão das mudanças\n3. Votação das alterações",
          quorumMinimo: 75,
          status: "CONVOCADA",
          ataUrl: null,
          votos: [],
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias atrás
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias atrás
        }
      ];
      
      // Simulando tempo de carregamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setList(mockData);
      setTotal(mockData.length);
    } catch (err) {
      console.error("Erro ao carregar assembleias:", err);
      push({ title: "Erro", message: "Falha de conexão ao carregar assembleias", kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [queryString, push]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (assembleia?: Assembleia) => {
    if (assembleia) {
      setEditingAssembleia(assembleia);
      setFormData({
        tipo: assembleia.tipo,
        titulo: assembleia.titulo,
        descricao: assembleia.descricao,
        dataAssembleia: assembleia.dataAssembleia.split('T')[0],
        local: assembleia.local,
        pauta: assembleia.pauta,
        quorumMinimo: assembleia.quorumMinimo.toString(),
      });
    } else {
      setEditingAssembleia(null);
      setFormData(initialFormData);
    }
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAssembleia(null);
    setFormData(initialFormData);
    setError("");
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.descricao.trim() || !formData.dataAssembleia.trim() || !formData.local.trim() || !formData.pauta.trim()) {
      setError("Título, descrição, data, local e pauta são obrigatórios.");
      return;
    }

    const quorum = parseInt(formData.quorumMinimo);
    if (isNaN(quorum) || quorum < 0 || quorum > 100) {
      setError("O quórum mínimo deve ser um valor entre 0 e 100.");
      return;
    }

    const payload = {
      ...formData,
      titulo: formData.titulo.trim(),
      descricao: formData.descricao.trim(),
      local: formData.local.trim(),
      pauta: formData.pauta.trim(),
      quorumMinimo: quorum,
    };

    setSaving(true);
    setError("");

    try {
      // Simulando chamada à API
      // const url = editingAssembleia ? `/api/assembleias/${editingAssembleia.id}` : "/api/assembleias";
      // const method = editingAssembleia ? "PUT" : "POST";

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
          title: editingAssembleia ? "Assembleia atualizada!" : "Assembleia criada!", 
          message: `A assembleia "${payload.titulo}" foi ${editingAssembleia ? 'atualizada' : 'criada'} com sucesso.`,
          kind: "success" 
        });
      } else {
        setError("Erro ao salvar assembleia.");
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
      // const response = await fetch(`/api/assembleias/${deleteConfirm.id}`, {
      //   method: "DELETE",
      // });

      // const data = await response.json();

      // Simulando resposta positiva
      await new Promise(resolve => setTimeout(resolve, 600));
      
      if (true) { // Simulando sucesso
        setDeleteConfirm(null);
        await load();
        push({ 
          title: "Assembleia excluída!", 
          message: `A assembleia "${deleteConfirm.titulo}" foi excluída com sucesso.`,
          kind: "success" 
        });
      } else {
        push({ title: "Erro", message: "Erro ao excluir assembleia.", kind: "error" });
      }
    } catch (err) {
      push({ title: "Erro", message: "Falha de conexão ao excluir assembleia.", kind: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterTipo("");
    setFilterSearch("");
    setPage(1);
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para formatar hora
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONCLUIDA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">Concluída</span>;
      case "EM_ANDAMENTO":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">Em Andamento</span>;
      case "CANCELADA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300">Cancelada</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300">Convocada</span>;
    }
  };

  // Type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "ORDINARIA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300">Ordinária</span>;
      case "EXTRAORDINARIA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">Extraordinária</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300">Desconhecido</span>;
    }
  };

  // Função para calcular presença/votos
  const calcularPresenca = (assembleia: Assembleia) => {
    // Em um sistema real, isso viria de uma API
    return { presentes: 28, total: 48, quorumAlcancado: true };
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-indigo-400" />
            Assembleias
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie as assembleias do condomínio
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-5 h-5" />
          Nova Assembleia
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
                className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Status</label>
            <select 
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            >
              <option value="">Todos</option>
              <option value="CONVOCADA">Convocada</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tipo</label>
            <select 
              value={filterTipo}
              onChange={(e) => { setFilterTipo(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            >
              <option value="">Todos</option>
              <option value="ORDINARIA">Ordinária</option>
              <option value="EXTRAORDINARIA">Extraordinária</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Local</label>
            <select 
              value=""
              onChange={() => {}}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            >
              <option value="">Todos</option>
              <option value="AUDITORIO">Auditório</option>
              <option value="SALAO">Salão de Festas</option>
              <option value="SALA_REUNIOES">Sala de Reuniões</option>
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
                <th className="text-left py-3 px-4 font-medium text-slate-300">Data</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Local</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Status</th>
                <th className="text-right py-3 px-4 font-medium text-slate-300">Presença</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300 w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                      Carregando assembleias...
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    Nenhuma assembleia encontrada.
                  </td>
                </tr>
              ) : (
                list.map((assembleia) => {
                  const presenca = calcularPresenca(assembleia);
                  return (
                    <tr
                      key={assembleia.id}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">{assembleia.titulo}</div>
                        <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {assembleia.descricao}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Quórum: {assembleia.quorumMinimo}% | Votos: {assembleia.votos.length}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getTypeBadge(assembleia.tipo)}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(assembleia.dataAssembleia)}
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Clock className="w-3 h-3" />
                            {formatTime(assembleia.dataAssembleia)}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {assembleia.local}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(assembleia.status)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-200 font-medium">
                        <div className="flex flex-col items-end">
                          <span>{presenca.presentes}/{presenca.total}</span>
                          <span className={`text-xs ${presenca.quorumAlcancado ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {presenca.quorumAlcancado ? 'Quórum OK' : 'Abaixo do quórum'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => openModal(assembleia)}
                            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(assembleia)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <div className="text-sm text-slate-400">
              Mostrando {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} de {total} assembleias
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
                <Users className="w-5 h-5 text-indigo-400" />
                {editingAssembleia ? "Editar Assembleia" : "Nova Assembleia"}
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
                    value={formData.tipo}
                    onChange={(e) => handleInputChange("tipo", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  >
                    <option value="ORDINARIA">Ordinária</option>
                    <option value="EXTRAORDINARIA">Extraordinária</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Data <span className="text-indigo-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="date"
                      value={formData.dataAssembleia}
                      onChange={(e) => handleInputChange("dataAssembleia", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition pl-10"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Título <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    value={formData.titulo}
                    onChange={(e) => handleInputChange("titulo", e.target.value)}
                    placeholder="Título da assembleia"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    autoFocus
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Descrição <span className="text-indigo-400">*</span>
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => handleInputChange("descricao", e.target.value)}
                    placeholder="Descrição da assembleia..."
                    rows={2}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Local <span className="text-indigo-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      value={formData.local}
                      onChange={(e) => handleInputChange("local", e.target.value)}
                      placeholder="Local da assembleia"
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Quórum Mínimo (%) <span className="text-indigo-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.quorumMinimo}
                      onChange={(e) => handleInputChange("quorumMinimo", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-8 pr-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Pauta <span className="text-indigo-400">*</span>
                  </label>
                  <textarea
                    value={formData.pauta}
                    onChange={(e) => handleInputChange("pauta", e.target.value)}
                    placeholder="Pauta da assembleia (tópicos a serem discutidos)..."
                    rows={4}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
                  />
                </div>
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
                      <>{editingAssembleia ? "Salvar Alterações" : "Criar Assembleia"}</>
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
                Excluir Assembleia?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Deseja realmente excluir a assembleia{" "}
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