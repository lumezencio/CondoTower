"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Package, Plus, Search, Filter, Edit2, Trash2, X, ChevronLeft, ChevronRight, Loader2, Calendar, User, Building2, MapPin, CheckCircle2, XCircle, Clock, Truck, Mail, PackageOpen } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type Encomenda = {
  id: string;
  tipo: string;
  remetente: string;
  descricao: string;
  bloco: string;
  apartamento: string;
  dataRecebimento: string;
  dataRetirada: string | null;
  retiradoPor: string | null;
  status: "PENDENTE" | "RETIRADA";
  observacoes: string | null;
  autorRegistro: string;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  tipo: string;
  remetente: string;
  descricao: string;
  bloco: string;
  apartamento: string;
  observacoes: string;
};

const initialFormData: FormData = {
  tipo: "CORREIOS",
  remetente: "",
  descricao: "",
  bloco: "",
  apartamento: "",
  observacoes: "",
};

export default function EncomendasPage() {
  const { push } = useToast();
  const [list, setList] = useState<Encomenda[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Filtros
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterBloco, setFilterBloco] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEncomenda, setEditingEncomenda] = useState<Encomenda | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Encomenda | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filterStatus.trim()) params.set("status", filterStatus.trim());
    if (filterTipo.trim()) params.set("tipo", filterTipo.trim());
    if (filterBloco.trim()) params.set("bloco", filterBloco.trim());
    if (filterSearch.trim()) params.set("search", filterSearch.trim());
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [filterStatus, filterTipo, filterBloco, filterSearch, page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Simulando chamada à API
      // const response = await fetch(`/api/encomendas?${queryString}`, { cache: "no-store" });
      // const data = await response.json();
      
      // Dados mockados para demonstração
      const mockData: Encomenda[] = [
        {
          id: "1",
          tipo: "CORREIOS",
          remetente: "ECT - Correios",
          descricao: "Pedido Amazon - Notebook Dell Inspiron",
          bloco: "A",
          apartamento: "302",
          dataRecebimento: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
          dataRetirada: null,
          retiradoPor: null,
          status: "PENDENTE",
          observacoes: "Fragil, manusear com cuidado",
          autorRegistro: "Porteiro Carlos",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          tipo: "TRANSPORTADORA",
          remetente: "Rodonorte Transportes",
          descricao: "Móveis para sala - Kit sofá e rack",
          bloco: "B",
          apartamento: "201",
          dataRecebimento: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
          dataRetirada: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
          retiradoPor: "João Silva (morador)",
          status: "RETIRADA",
          observacoes: "Volumoso, necessário 2 pessoas para carregar",
          autorRegistro: "Porteiro Carlos",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          tipo: "ENTREGADOR",
          remetente: "IFood Market",
          descricao: "Compra delivery - Produtos de limpeza",
          bloco: "C",
          apartamento: "101",
          dataRecebimento: new Date().toISOString(), // Hoje
          dataRetirada: null,
          retiradoPor: null,
          status: "PENDENTE",
          observacoes: "Entrega de compras do supermercado",
          autorRegistro: "Porteiro Maria",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "4",
          tipo: "SEDEX",
          remetente: "ECT - Correios",
          descricao: "Documentos importantes - Carta registrada",
          bloco: "A",
          apartamento: "401",
          dataRecebimento: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
          dataRetirada: null,
          retiradoPor: null,
          status: "PENDENTE",
          observacoes: "Requer identidade para retirada",
          autorRegistro: "Porteiro Carlos",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];
      
      // Simulando tempo de carregamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setList(mockData);
      setTotal(mockData.length);
    } catch (err) {
      console.error("Erro ao carregar encomendas:", err);
      push({ title: "Erro", message: "Falha de conexão ao carregar encomendas", kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [queryString, push]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (encomenda?: Encomenda) => {
    if (encomenda) {
      setEditingEncomenda(encomenda);
      setFormData({
        tipo: encomenda.tipo,
        remetente: encomenda.remetente,
        descricao: encomenda.descricao,
        bloco: encomenda.bloco,
        apartamento: encomenda.apartamento,
        observacoes: encomenda.observacoes || "",
      });
    } else {
      setEditingEncomenda(null);
      setFormData(initialFormData);
    }
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEncomenda(null);
    setFormData(initialFormData);
    setError("");
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.remetente.trim() || !formData.descricao.trim() || !formData.bloco.trim() || !formData.apartamento.trim()) {
      setError("Remetente, descrição, bloco e apartamento são obrigatórios.");
      return;
    }

    const payload = {
      ...formData,
      remetente: formData.remetente.trim(),
      descricao: formData.descricao.trim(),
      bloco: formData.bloco.toUpperCase(),
      apartamento: formData.apartamento.toUpperCase(),
    };

    setSaving(true);
    setError("");

    try {
      // Simulando chamada à API
      // const url = editingEncomenda ? `/api/encomendas/${editingEncomenda.id}` : "/api/encomendas";
      // const method = editingEncomenda ? "PUT" : "POST";

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
          title: editingEncomenda ? "Encomenda atualizada!" : "Encomenda registrada!", 
          message: `A encomenda "${payload.descricao}" foi ${editingEncomenda ? 'atualizada' : 'registrada'} com sucesso.`,
          kind: "success" 
        });
      } else {
        setError("Erro ao salvar encomenda.");
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
      // const response = await fetch(`/api/encomendas/${deleteConfirm.id}`, {
      //   method: "DELETE",
      // });

      // const data = await response.json();

      // Simulando resposta positiva
      await new Promise(resolve => setTimeout(resolve, 600));
      
      if (true) { // Simulando sucesso
        setDeleteConfirm(null);
        await load();
        push({ 
          title: "Encomenda excluída!", 
          message: `A encomenda "${deleteConfirm.descricao}" foi excluída com sucesso.`,
          kind: "success" 
        });
      } else {
        push({ title: "Erro", message: "Erro ao excluir encomenda.", kind: "error" });
      }
    } catch (err) {
      push({ title: "Erro", message: "Falha de conexão ao excluir encomenda.", kind: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterTipo("");
    setFilterBloco("");
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
      case "RETIRADA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">Retirada</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300">Pendente</span>;
    }
  };

  // Type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "CORREIOS":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">Correios</span>;
      case "SEDEX":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300">Sedex</span>;
      case "TRANSPORTADORA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">Transportadora</span>;
      case "ENTREGADOR":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">Entregador</span>;
      case "OUTRO":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300">Outro</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300">Desconhecido</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Package className="w-7 h-7 text-rose-400" />
            Controle de Encomendas
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie as encomendas recebidas no condomínio
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-rose-500/25"
        >
          <Plus className="w-5 h-5" />
          Nova Encomenda
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
                placeholder="Descrição ou remetente..."
                className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Status</label>
            <select 
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
            >
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="RETIRADA">Retirada</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tipo</label>
            <select 
              value={filterTipo}
              onChange={(e) => { setFilterTipo(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
            >
              <option value="">Todos</option>
              <option value="CORREIOS">Correios</option>
              <option value="SEDEX">Sedex</option>
              <option value="TRANSPORTADORA">Transportadora</option>
              <option value="ENTREGADOR">Entregador</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Bloco</label>
            <select 
              value={filterBloco}
              onChange={(e) => { setFilterBloco(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
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
                <th className="text-left py-3 px-4 font-medium text-slate-300">Descrição</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Tipo</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Remetente</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Unidade</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Recebida em</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Retirada em</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300 w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
                      Carregando encomendas...
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    Nenhuma encomenda encontrada.
                  </td>
                </tr>
              ) : (
                list.map((encomenda) => (
                  <tr
                    key={encomenda.id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-rose-400" />
                        <div>
                          <div className="font-medium text-slate-200">{encomenda.descricao}</div>
                          {encomenda.observacoes && (
                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                              <span className="font-medium">Obs:</span> {encomenda.observacoes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getTypeBadge(encomenda.tipo)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        {encomenda.tipo === 'CORREIOS' || encomenda.tipo === 'SEDEX' ? (
                          <Mail className="w-3 h-3" />
                        ) : encomenda.tipo === 'TRANSPORTADORA' ? (
                          <Truck className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {encomenda.remetente}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {encomenda.bloco} - {encomenda.apartamento}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(encomenda.status)}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {formatDate(encomenda.dataRecebimento)}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {encomenda.dataRetirada ? formatDate(encomenda.dataRetirada) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openModal(encomenda)}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(encomenda)}
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
              Mostrando {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} de {total} encomendas
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
                        ? "bg-rose-600 text-white"
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
                <Package className="w-5 h-5 text-rose-400" />
                {editingEncomenda ? "Editar Encomenda" : "Nova Encomenda"}
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
                    Tipo <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => handleInputChange("tipo", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
                  >
                    <option value="CORREIOS">Correios</option>
                    <option value="SEDEX">Sedex</option>
                    <option value="TRANSPORTADORA">Transportadora</option>
                    <option value="ENTREGADOR">Entregador</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Bloco <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.bloco}
                    onChange={(e) => handleInputChange("bloco", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
                  >
                    <option value="">Selecione o bloco</option>
                    <option value="A">Bloco A</option>
                    <option value="B">Bloco B</option>
                    <option value="C">Bloco C</option>
                    <option value="D">Bloco D</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Apartamento <span className="text-rose-400">*</span>
                  </label>
                  <input
                    value={formData.apartamento}
                    onChange={(e) => handleInputChange("apartamento", e.target.value)}
                    placeholder="Número do apartamento"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Remetente <span className="text-rose-400">*</span>
                  </label>
                  <input
                    value={formData.remetente}
                    onChange={(e) => handleInputChange("remetente", e.target.value)}
                    placeholder="Nome do remetente"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Descrição <span className="text-rose-400">*</span>
                  </label>
                  <input
                    value={formData.descricao}
                    onChange={(e) => handleInputChange("descricao", e.target.value)}
                    placeholder="Descrição da encomenda"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
                    autoFocus
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange("observacoes", e.target.value)}
                    placeholder="Observações sobre a encomenda (fragil, volumoso, etc)"
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <div className="text-sm text-slate-400">
                  <p>Campos marcados com <span className="text-rose-400">*</span> são obrigatórios</p>
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
                    className="px-6 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>{editingEncomenda ? "Salvar Alterações" : "Registrar Encomenda"}</>
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
                Excluir Encomenda?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Deseja realmente excluir a encomenda{" "}
                <span className="text-white font-medium">
                  "{deleteConfirm.descricao}"
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