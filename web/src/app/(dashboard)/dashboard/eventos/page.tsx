"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { CalendarDays, Plus, Search, Filter, Edit2, Trash2, X, ChevronLeft, ChevronRight, Loader2, Calendar, Clock, Users, Building2, MapPin, DollarSign, CheckCircle2, XCircle, User, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type AreaComum = {
  id: string;
  nome: string;
  descricao: string;
  capacidade: number | null;
  valorReserva: number | null;
  tempoMinReserva: number; // em minutos
  tempoMaxReserva: number; // em minutos
  antecedenciaMin: number; // em horas
  antecedenciaMax: number; // em horas
  requerAprovacao: boolean;
  ativo: boolean;
  regras: string | null;
  fotos: string[];
  createdAt: string;
  updatedAt: string;
};

type Reserva = {
  id: string;
  areaComum: AreaComum;
  bloco: string;
  apartamento: string;
  dataInicio: string;
  dataFim: string;
  status: "PENDENTE" | "APROVADA" | "REJEITADA" | "CANCELADA" | "CONCLUIDA";
  valor: number | null;
  observacoes: string | null;
  motivoRejeicao: string | null;
  autor: string;
  dataReserva: string;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  areaComumId: string;
  bloco: string;
  apartamento: string;
  dataInicio: string;
  dataFim: string;
  observacoes: string;
};

const initialFormData: FormData = {
  areaComumId: "",
  bloco: "",
  apartamento: "",
  dataInicio: "",
  dataFim: "",
  observacoes: "",
};

export default function ReservasAreasComunsPage() {
  const { push } = useToast();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [areasComuns, setAreasComuns] = useState<AreaComum[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Filtros
  const [filterStatus, setFilterStatus] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterBloco, setFilterBloco] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Reserva | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filterStatus.trim()) params.set("status", filterStatus.trim());
    if (filterArea.trim()) params.set("area", filterArea.trim());
    if (filterBloco.trim()) params.set("bloco", filterBloco.trim());
    if (filterSearch.trim()) params.set("search", filterSearch.trim());
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [filterStatus, filterArea, filterBloco, filterSearch, page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Simulando chamada à API
      // const response = await fetch(`/api/reservas?${queryString}`, { cache: "no-store" });
      // const data = await response.json();
      
      // Dados mockados para demonstração
      const mockAreas: AreaComum[] = [
        {
          id: "1",
          nome: "Salão de Festas",
          descricao: "Salão de festas com cozinha, área de lazer e estacionamento",
          capacidade: 80,
          valorReserva: 300.00,
          tempoMinReserva: 120,
          tempoMaxReserva: 480,
          antecedenciaMin: 48,
          antecedenciaMax: 720,
          requerAprovacao: true,
          ativo: true,
          regras: "Não é permitido som alto após às 22h. Limpeza deve ser feita após o evento.",
          fotos: ["/images/salao.jpg"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          nome: "Churrasqueira",
          descricao: "Área de churrasco com pia e espaço para mesas",
          capacidade: 30,
          valorReserva: 150.00,
          tempoMinReserva: 180,
          tempoMaxReserva: 360,
          antecedenciaMin: 24,
          antecedenciaMax: 720,
          requerAprovacao: true,
          ativo: true,
          regras: "Fornecemos carvão e utensílios básicos. Limpeza obrigatória após uso.",
          fotos: ["/images/churrasqueira.jpg"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          nome: "Quadra Poliesportiva",
          descricao: "Quadra poliesportiva para basquete, vôlei e futebol society",
          capacidade: 30,
          valorReserva: 200.00,
          tempoMinReserva: 60,
          tempoMaxReserva: 240,
          antecedenciaMin: 24,
          antecedenciaMax: 720,
          requerAprovacao: true,
          ativo: true,
          regras: "Equipamentos esportivos não fornecidos. Reserva apenas para atividades esportivas.",
          fotos: ["/images/quadra.jpg"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "4",
          nome: "Espaço Gourmet",
          descricao: "Cozinha gourmet com forno a lenha e mesa para 12 pessoas",
          capacidade: 12,
          valorReserva: 250.00,
          tempoMinReserva: 180,
          tempoMaxReserva: 360,
          antecedenciaMin: 48,
          antecedenciaMax: 720,
          requerAprovacao: true,
          ativo: true,
          regras: "Acesso apenas com supervisão do zelador. Não é permitido levar bebidas alcoólicas externas.",
          fotos: ["/images/gourmet.jpg"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      
      const mockReservas: Reserva[] = [
        {
          id: "1",
          areaComum: mockAreas[0], // Salão de Festas
          bloco: "A",
          apartamento: "302",
          dataInicio: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), // Daqui a 7 dias
          dataFim: new Date(new Date(new Date().setDate(new Date().getDate() + 7)).setHours(22, 0, 0, 0)).toISOString(),
          status: "APROVADA",
          valor: 300.00,
          observacoes: "Festa de aniversário infantil",
          motivoRejeicao: null,
          autor: "Maria Silva",
          dataReserva: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias atrás
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          areaComum: mockAreas[1], // Churrasqueira
          bloco: "B",
          apartamento: "201",
          dataInicio: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), // Daqui a 3 dias
          dataFim: new Date(new Date(new Date().setDate(new Date().getDate() + 3)).setHours(18, 0, 0, 0)).toISOString(),
          status: "PENDENTE",
          valor: 150.00,
          observacoes: "Churrasco familiar",
          motivoRejeicao: null,
          autor: "João Santos",
          dataReserva: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          areaComum: mockAreas[2], // Quadra Poliesportiva
          bloco: "C",
          apartamento: "101",
          dataInicio: new Date().toISOString(), // Hoje
          dataFim: new Date(new Date(new Date()).setHours(12, 0, 0, 0)).toISOString(),
          status: "CONCLUIDA",
          valor: 200.00,
          observacoes: "Treino de futebol",
          motivoRejeicao: null,
          autor: "Pedro Costa",
          dataReserva: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 dias atrás
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "4",
          areaComum: mockAreas[0], // Salão de Festas
          bloco: "A",
          apartamento: "401",
          dataInicio: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Ontem
          dataFim: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(23, 0, 0, 0)).toISOString(),
          status: "REJEITADA",
          valor: 300.00,
          observacoes: "Festa de confraternização",
          motivoRejeicao: "Regras de horário não respeitadas",
          autor: "Ana Oliveira",
          dataReserva: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 dias atrás
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];
      
      // Simulando tempo de carregamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAreasComuns(mockAreas);
      setReservas(mockReservas);
      setTotal(mockReservas.length);
    } catch (err) {
      console.error("Erro ao carregar reservas:", err);
      push({ title: "Erro", message: "Falha de conexão ao carregar reservas", kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [queryString, push]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (reserva?: Reserva) => {
    if (reserva) {
      setEditingReserva(reserva);
      setFormData({
        areaComumId: reserva.areaComum.id,
        bloco: reserva.bloco,
        apartamento: reserva.apartamento,
        dataInicio: reserva.dataInicio.split('T')[0] + 'T' + reserva.dataInicio.split('T')[1].substring(0, 5),
        dataFim: reserva.dataFim.split('T')[0] + 'T' + reserva.dataFim.split('T')[1].substring(0, 5),
        observacoes: reserva.observacoes || "",
      });
    } else {
      setEditingReserva(null);
      setFormData(initialFormData);
    }
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReserva(null);
    setFormData(initialFormData);
    setError("");
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.areaComumId || !formData.bloco || !formData.apartamento || !formData.dataInicio || !formData.dataFim) {
      setError("Todos os campos obrigatórios devem ser preenchidos.");
      return;
    }

    // Validar datas
    const startDate = new Date(formData.dataInicio);
    const endDate = new Date(formData.dataFim);
    
    if (startDate >= endDate) {
      setError("A data de término deve ser posterior à data de início.");
      return;
    }

    const payload = {
      ...formData,
      bloco: formData.bloco.toUpperCase(),
      apartamento: formData.apartamento.toUpperCase(),
    };

    setSaving(true);
    setError("");

    try {
      // Simulando chamada à API
      // const url = editingReserva ? `/api/reservas/${editingReserva.id}` : "/api/reservas";
      // const method = editingReserva ? "PUT" : "POST";

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
          title: editingReserva ? "Reserva atualizada!" : "Reserva criada!", 
          message: `A reserva para "${areasComuns.find(a => a.id === formData.areaComumId)?.nome}" foi ${editingReserva ? 'atualizada' : 'criada'} com sucesso.`,
          kind: "success" 
        });
      } else {
        setError("Erro ao salvar reserva.");
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
      // const response = await fetch(`/api/reservas/${deleteConfirm.id}`, {
      //   method: "DELETE",
      // });

      // const data = await response.json();

      // Simulando resposta positiva
      await new Promise(resolve => setTimeout(resolve, 600));
      
      if (true) { // Simulando sucesso
        setDeleteConfirm(null);
        await load();
        push({ 
          title: "Reserva excluída!", 
          message: `A reserva para "${deleteConfirm.areaComum.nome}" foi excluída com sucesso.`,
          kind: "success" 
        });
      } else {
        push({ title: "Erro", message: "Erro ao excluir reserva.", kind: "error" });
      }
    } catch (err) {
      push({ title: "Erro", message: "Falha de conexão ao excluir reserva.", kind: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterArea("");
    setFilterBloco("");
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
      case "APROVADA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">Aprovada</span>;
      case "PENDENTE":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300">Pendente</span>;
      case "REJEITADA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300">Rejeitada</span>;
      case "CANCELADA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300">Cancelada</span>;
      case "CONCLUIDA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">Concluída</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300">Desconhecido</span>;
    }
  };

  // Função para formatar moeda
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CalendarDays className="w-7 h-7 text-violet-400" />
            Reservas de Áreas Comuns
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie as reservas das áreas comuns do condomínio
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-violet-500/25"
        >
          <Plus className="w-5 h-5" />
          Nova Reserva
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
                placeholder="Bloco, apto ou área..."
                className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Status</label>
            <select 
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
            >
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="APROVADA">Aprovada</option>
              <option value="REJEITADA">Rejeitada</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="CONCLUIDA">Concluída</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Área Comum</label>
            <select 
              value={filterArea}
              onChange={(e) => { setFilterArea(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
            >
              <option value="">Todas</option>
              {areasComuns.map(area => (
                <option key={area.id} value={area.id}>{area.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Bloco</label>
            <select 
              value={filterBloco}
              onChange={(e) => { setFilterBloco(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
            >
              <option value="">Todos</option>
              <option value="A">Bloco A</option>
              <option value="B">Bloco B</option>
              <option value="C">Bloco C</option>
              <option value="D">Bloco D</option>
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
                <th className="text-left py-3 px-4 font-medium text-slate-300">Área</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Unidade</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Data/Hora</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Status</th>
                <th className="text-right py-3 px-4 font-medium text-slate-300">Valor</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Autor</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300 w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                      Carregando reservas...
                    </div>
                  </td>
                </tr>
              ) : reservas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    Nenhuma reserva encontrada.
                  </td>
                </tr>
              ) : (
                reservas.map((reserva) => (
                  <tr
                    key={reserva.id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-violet-400" />
                        <div>
                          <div className="font-medium text-slate-200">{reserva.areaComum.nome}</div>
                          <div className="text-xs text-slate-400">
                            {reserva.areaComum.descricao?.substring(0, 40)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {reserva.bloco} - {reserva.apartamento}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(reserva.dataInicio)}
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Clock className="w-3 h-3" />
                          {formatTime(reserva.dataInicio)} - {formatTime(reserva.dataFim)}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(reserva.status)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-200 font-medium">
                      {formatCurrency(reserva.valor)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {reserva.autor}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openModal(reserva)}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(reserva)}
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
              Mostrando {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} de {total} reservas
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
                        ? "bg-violet-600 text-white"
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
                <CalendarDays className="w-5 h-5 text-violet-400" />
                {editingReserva ? "Editar Reserva" : "Nova Reserva"}
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
                    Área Comum <span className="text-violet-400">*</span>
                  </label>
                  <select
                    value={formData.areaComumId}
                    onChange={(e) => handleInputChange("areaComumId", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                  >
                    <option value="">Selecione uma área</option>
                    {areasComuns.map(area => (
                      <option key={area.id} value={area.id}>{area.nome}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                      Bloco <span className="text-violet-400">*</span>
                    </label>
                    <select
                      value={formData.bloco}
                      onChange={(e) => handleInputChange("bloco", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                    >
                      <option value="">Selecione</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                      Apartamento <span className="text-violet-400">*</span>
                    </label>
                    <input
                      value={formData.apartamento}
                      onChange={(e) => handleInputChange("apartamento", e.target.value)}
                      placeholder="Número"
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Data e Hora Início <span className="text-violet-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="datetime-local"
                      value={formData.dataInicio}
                      onChange={(e) => handleInputChange("dataInicio", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Data e Hora Fim <span className="text-violet-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="datetime-local"
                      value={formData.dataFim}
                      onChange={(e) => handleInputChange("dataFim", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition pl-10"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange("observacoes", e.target.value)}
                    placeholder="Informações adicionais sobre a reserva..."
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition resize-none"
                  />
                </div>
              </div>

              {formData.areaComumId && (
                <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-violet-400" />
                    Detalhes da Área Selecionada
                  </h3>
                  {(() => {
                    const area = areasComuns.find(a => a.id === formData.areaComumId);
                    if (!area) return null;
                    
                    return (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Capacidade:</span>
                          <span className="text-slate-300">{area.capacidade ? `${area.capacidade} pessoas` : 'Não especificada'}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Valor:</span>
                          <span className="text-slate-300">{formatCurrency(area.valorReserva)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Tempo Mín:</span>
                          <span className="text-slate-300">{area.tempoMinReserva} min</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Tempo Máx:</span>
                          <span className="text-slate-300">{area.tempoMaxReserva} min</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Antec. Mín:</span>
                          <span className="text-slate-300">{area.antecedenciaMin}h</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Antec. Máx:</span>
                          <span className="text-slate-300">{area.antecedenciaMax}h</span>
                        </div>
                        
                        <div className="flex items-center gap-1 col-span-2">
                          <span className="text-slate-400">Requer Aprovação:</span>
                          <span className="text-slate-300">{area.requerAprovacao ? 'Sim' : 'Não'}</span>
                        </div>
                        
                        {area.regras && (
                          <div className="col-span-2">
                            <span className="text-slate-400">Regras:</span>
                            <p className="text-slate-300 text-xs mt-1">{area.regras}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <div className="text-sm text-slate-400">
                  <p>Campos marcados com <span className="text-violet-400">*</span> são obrigatórios</p>
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
                    className="px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>{editingReserva ? "Salvar Alterações" : "Criar Reserva"}</>
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
                Excluir Reserva?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Deseja realmente excluir a reserva para{" "}
                <span className="text-white font-medium">
                  "{deleteConfirm.areaComum.nome}"
                </span>
                ?
              </p>
              <div className="text-xs text-slate-500 mb-4">
                <p>Data: {formatDate(deleteConfirm.dataInicio)} das {formatTime(deleteConfirm.dataInicio)} às {formatTime(deleteConfirm.dataFim)}</p>
                <p>Unidade: {deleteConfirm.bloco} - {deleteConfirm.apartamento}</p>
              </div>
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