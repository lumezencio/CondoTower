"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FileText, Plus, Search, Filter, Edit2, Trash2, X, ChevronLeft, ChevronRight, Loader2, Calendar, Folder, Download, Eye, Archive, Tag, Users, Building2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type Documento = {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  arquivoUrl: string;
  tamanho: number; // em bytes
  tipoArquivo: string; // pdf, doc, docx, jpg, etc
  visibilidade: "ADMINISTRACAO" | "CONSELHO" | "TODOS";
  autor: string;
  dataUpload: string;
  bloco: string | null;
  unidade: string | null;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  nome: string;
  descricao: string;
  categoria: string;
  arquivoUrl: string;
  visibilidade: string;
  bloco: string;
  unidade: string;
};

const initialFormData: FormData = {
  nome: "",
  descricao: "",
  categoria: "ATA_ASSEMBLEIA",
  arquivoUrl: "",
  visibilidade: "TODOS",
  bloco: "",
  unidade: "",
};

export default function DocumentosPage() {
  const { push } = useToast();
  const [list, setList] = useState<Documento[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Filtros
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterVisibilidade, setFilterVisibilidade] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocumento, setEditingDocumento] = useState<Documento | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Documento | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filterCategoria.trim()) params.set("categoria", filterCategoria.trim());
    if (filterVisibilidade.trim()) params.set("visibilidade", filterVisibilidade.trim());
    if (filterSearch.trim()) params.set("search", filterSearch.trim());
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [filterCategoria, filterVisibilidade, filterSearch, page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Simulando chamada à API
      // const response = await fetch(`/api/documentos?${queryString}`, { cache: "no-store" });
      // const data = await response.json();
      
      // Dados mockados para demonstração
      const mockData: Documento[] = [
        {
          id: "1",
          nome: "Ata da Assembleia de Janeiro",
          descricao: "Ata da assembleia ordinária do mês de janeiro de 2026",
          categoria: "ATA_ASSEMBLEIA",
          arquivoUrl: "/docs/ata_janeiro_2026.pdf",
          tamanho: 1024000, // 1MB
          tipoArquivo: "pdf",
          visibilidade: "TODOS",
          autor: "Síndico",
          dataUpload: new Date().toISOString(),
          bloco: null,
          unidade: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          nome: "Contrato com Empresa de Limpeza",
          descricao: "Contrato vigente com empresa de limpeza terceirizada",
          categoria: "CONTRATO",
          arquivoUrl: "/docs/contrato_limpeza.pdf",
          tamanho: 2048000, // 2MB
          tipoArquivo: "pdf",
          visibilidade: "ADMINISTRACAO",
          autor: "Síndico",
          dataUpload: new Date().toISOString(),
          bloco: null,
          unidade: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          nome: "Regimento Interno Atualizado",
          descricao: "Regimento interno revisado e aprovado na última assembleia",
          categoria: "REGIMENTO_INTERNO",
          arquivoUrl: "/docs/regimento_interno_atualizado.pdf",
          tamanho: 512000, // 500KB
          tipoArquivo: "pdf",
          visibilidade: "TODOS",
          autor: "Conselho Fiscal",
          dataUpload: new Date().toISOString(),
          bloco: null,
          unidade: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "4",
          nome: "Planta Baixa do Bloco A",
          descricao: "Planta baixa do bloco A com medidas e especificações",
          categoria: "PROJETO_PLANTA",
          arquivoUrl: "/docs/planta_bloco_a.pdf",
          tamanho: 3072000, // 3MB
          tipoArquivo: "pdf",
          visibilidade: "CONSELHO",
          autor: "Engenheiro Responsável",
          dataUpload: new Date().toISOString(),
          bloco: "A",
          unidade: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      
      // Simulando tempo de carregamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setList(mockData);
      setTotal(mockData.length);
    } catch (err) {
      console.error("Erro ao carregar documentos:", err);
      push({ title: "Erro", message: "Falha de conexão ao carregar documentos", kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [queryString, push]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (documento?: Documento) => {
    if (documento) {
      setEditingDocumento(documento);
      setFormData({
        nome: documento.nome,
        descricao: documento.descricao,
        categoria: documento.categoria,
        arquivoUrl: documento.arquivoUrl,
        visibilidade: documento.visibilidade,
        bloco: documento.bloco || "",
        unidade: documento.unidade || "",
      });
    } else {
      setEditingDocumento(null);
      setFormData(initialFormData);
    }
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDocumento(null);
    setFormData(initialFormData);
    setError("");
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.arquivoUrl.trim()) {
      setError("Nome e URL do arquivo são obrigatórios.");
      return;
    }

    const payload = {
      ...formData,
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim(),
    };

    setSaving(true);
    setError("");

    try {
      // Simulando chamada à API
      // const url = editingDocumento ? `/api/documentos/${editingDocumento.id}` : "/api/documentos";
      // const method = editingDocumento ? "PUT" : "POST";

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
          title: editingDocumento ? "Documento atualizado!" : "Documento criado!", 
          message: `O documento "${payload.nome}" foi ${editingDocumento ? 'atualizado' : 'criado'} com sucesso.`,
          kind: "success" 
        });
      } else {
        setError("Erro ao salvar documento.");
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
      // const response = await fetch(`/api/documentos/${deleteConfirm.id}`, {
      //   method: "DELETE",
      // });

      // const data = await response.json();

      // Simulando resposta positiva
      await new Promise(resolve => setTimeout(resolve, 600));
      
      if (true) { // Simulando sucesso
        setDeleteConfirm(null);
        await load();
        push({ 
          title: "Documento excluído!", 
          message: `O documento "${deleteConfirm.nome}" foi excluído com sucesso.`,
          kind: "success" 
        });
      } else {
        push({ title: "Erro", message: "Erro ao excluir documento.", kind: "error" });
      }
    } catch (err) {
      push({ title: "Erro", message: "Falha de conexão ao excluir documento.", kind: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterCategoria("");
    setFilterVisibilidade("");
    setFilterSearch("");
    setPage(1);
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para formatar tamanho de arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Category badge
  const getCategoryBadge = (categoria: string) => {
    switch (categoria) {
      case "ATA_ASSEMBLEIA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">Ata de Assembleia</span>;
      case "CONVENCAO":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">Convenção</span>;
      case "REGIMENTO_INTERNO":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300">Regimento Interno</span>;
      case "CONTRATO":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">Contrato</span>;
      case "APOLICE_SEGURO":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300">Apólice de Seguro</span>;
      case "FISCAL":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300">Fiscal</span>;
      case "PROJETO_PLANTA":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/20 text-teal-300">Projeto/Planta</span>;
      case "MANUAL_EQUIPAMENTO":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300">Manual de Equipamento</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300">Outro</span>;
    }
  };

  // Visibility badge
  const getVisibilityBadge = (visibilidade: string) => {
    switch (visibilidade) {
      case "ADMINISTRACAO":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300">Administração</span>;
      case "CONSELHO":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300">Conselho</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">Todos</span>;
    }
  };

  // Função para obter ícone do tipo de arquivo
  const getFileIcon = (tipoArquivo: string) => {
    switch (tipoArquivo.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-400" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="w-5 h-5 text-green-400" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileText className="w-5 h-5 text-amber-400" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-emerald-400" />
            Documentos
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie os documentos e arquivos do condomínio
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/25"
        >
          <Plus className="w-5 h-5" />
          Novo Documento
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
                placeholder="Nome ou descrição..."
                className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Categoria</label>
            <select 
              value={filterCategoria}
              onChange={(e) => { setFilterCategoria(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
            >
              <option value="">Todas</option>
              <option value="ATA_ASSEMBLEIA">Ata de Assembleia</option>
              <option value="CONVENCAO">Convenção</option>
              <option value="REGIMENTO_INTERNO">Regimento Interno</option>
              <option value="CONTRATO">Contrato</option>
              <option value="APOLICE_SEGURO">Apólice de Seguro</option>
              <option value="FISCAL">Fiscal</option>
              <option value="PROJETO_PLANTA">Projeto/Planta</option>
              <option value="MANUAL_EQUIPAMENTO">Manual de Equipamento</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Visibilidade</label>
            <select 
              value={filterVisibilidade}
              onChange={(e) => { setFilterVisibilidade(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
            >
              <option value="">Todas</option>
              <option value="TODOS">Todos</option>
              <option value="CONSELHO">Conselho</option>
              <option value="ADMINISTRACAO">Administração</option>
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
                <th className="text-left py-3 px-4 font-medium text-slate-300">Documento</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Categoria</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Visibilidade</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Autor</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Data</th>
                <th className="text-right py-3 px-4 font-medium text-slate-300">Tamanho</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300 w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                      Carregando documentos...
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    Nenhum documento encontrado.
                  </td>
                </tr>
              ) : (
                list.map((documento) => (
                  <tr
                    key={documento.id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(documento.tipoArquivo)}
                        <div>
                          <div className="font-medium text-slate-200">{documento.nome}</div>
                          <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                            {documento.descricao}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {documento.tipoArquivo.toUpperCase()} • {formatFileSize(documento.tamanho)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getCategoryBadge(documento.categoria)}
                    </td>
                    <td className="py-3 px-4">
                      {getVisibilityBadge(documento.visibilidade)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {documento.autor}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {formatDate(documento.dataUpload)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-200">
                      {formatFileSize(documento.tamanho)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <a
                          href={documento.arquivoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <a
                          href={documento.arquivoUrl}
                          download
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openModal(documento)}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(documento)}
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
              Mostrando {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} de {total} documentos
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
                        ? "bg-emerald-600 text-white"
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
                <FileText className="w-5 h-5 text-emerald-400" />
                {editingDocumento ? "Editar Documento" : "Novo Documento"}
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
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Nome do Documento <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    value={formData.nome}
                    onChange={(e) => handleInputChange("nome", e.target.value)}
                    placeholder="Nome do documento"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    autoFocus
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => handleInputChange("descricao", e.target.value)}
                    placeholder="Descrição do documento..."
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Categoria <span className="text-emerald-400">*</span>
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => handleInputChange("categoria", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  >
                    <option value="ATA_ASSEMBLEIA">Ata de Assembleia</option>
                    <option value="CONVENCAO">Convenção</option>
                    <option value="REGIMENTO_INTERNO">Regimento Interno</option>
                    <option value="CONTRATO">Contrato</option>
                    <option value="APOLICE_SEGURO">Apólice de Seguro</option>
                    <option value="FISCAL">Fiscal</option>
                    <option value="PROJETO_PLANTA">Projeto/Planta</option>
                    <option value="MANUAL_EQUIPAMENTO">Manual de Equipamento</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Visibilidade <span className="text-emerald-400">*</span>
                  </label>
                  <select
                    value={formData.visibilidade}
                    onChange={(e) => handleInputChange("visibilidade", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  >
                    <option value="TODOS">Todos os condôminos</option>
                    <option value="CONSELHO">Conselho Fiscal</option>
                    <option value="ADMINISTRACAO">Administração</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Bloco (opcional)
                  </label>
                  <select
                    value={formData.bloco}
                    onChange={(e) => handleInputChange("bloco", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  >
                    <option value="">Todos os blocos</option>
                    <option value="A">Bloco A</option>
                    <option value="B">Bloco B</option>
                    <option value="C">Bloco C</option>
                    <option value="D">Bloco D</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Unidade (opcional)
                  </label>
                  <input
                    value={formData.unidade}
                    onChange={(e) => handleInputChange("unidade", e.target.value)}
                    placeholder="Ex: 101"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    URL do Arquivo <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    value={formData.arquivoUrl}
                    onChange={(e) => handleInputChange("arquivoUrl", e.target.value)}
                    placeholder="https://exemplo.com/documento.pdf"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <div className="text-sm text-slate-400">
                  <p>Campos marcados com <span className="text-emerald-400">*</span> são obrigatórios</p>
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
                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>{editingDocumento ? "Salvar Alterações" : "Cadastrar Documento"}</>
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
                Excluir Documento?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Deseja realmente excluir o documento{" "}
                <span className="text-white font-medium">
                  "{deleteConfirm.nome}"
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