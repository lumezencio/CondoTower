"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Dog, Cat, Plus, Search, Filter, Edit2, Trash2, X, ChevronLeft, ChevronRight, Loader2, Calendar, User, Building2, MapPin, Heart, Bone, Utensils, Syringe, FileText } from "lucide-react";
import { useToast } from "@/components/ui/toast";

type Pet = {
  id: string;
  nome: string;
  especie: string;
  raca: string;
  cor: string;
  porte: "PEQUENO" | "MEDIO" | "GRANDE";
  dataNascimento: string | null;
  vacinado: boolean;
  fotoUrl: string | null;
  observacoes: string | null;
  bloco: string;
  apartamento: string;
  proprietario: string;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  nome: string;
  especie: string;
  raca: string;
  cor: string;
  porte: string;
  dataNascimento: string;
  vacinado: boolean;
  fotoUrl: string;
  observacoes: string;
  bloco: string;
  apartamento: string;
  proprietario: string;
};

const initialFormData: FormData = {
  nome: "",
  especie: "CAO",
  raca: "",
  cor: "",
  porte: "MEDIO",
  dataNascimento: "",
  vacinado: true,
  fotoUrl: "",
  observacoes: "",
  bloco: "",
  apartamento: "",
  proprietario: "",
};

export default function PetsPage() {
  const { push } = useToast();
  const [list, setList] = useState<Pet[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Filtros
  const [filterEspecie, setFilterEspecie] = useState("");
  const [filterPorte, setFilterPorte] = useState("");
  const [filterBloco, setFilterBloco] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Pet | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filterEspecie.trim()) params.set("especie", filterEspecie.trim());
    if (filterPorte.trim()) params.set("porte", filterPorte.trim());
    if (filterBloco.trim()) params.set("bloco", filterBloco.trim());
    if (filterSearch.trim()) params.set("search", filterSearch.trim());
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [filterEspecie, filterPorte, filterBloco, filterSearch, page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Simulando chamada à API
      // const response = await fetch(`/api/pets?${queryString}`, { cache: "no-store" });
      // const data = await response.json();
      
      // Dados mockados para demonstração
      const mockData: Pet[] = [
        {
          id: "1",
          nome: "Bidu",
          especie: "CAO",
          raca: "Shiba Inu",
          cor: "Marrom e branco",
          porte: "PEQUENO",
          dataNascimento: new Date(2020, 5, 15).toISOString(),
          vacinado: true,
          fotoUrl: "/images/bidu.jpg",
          observacoes: "Calmo e sociável",
          bloco: "A",
          apartamento: "302",
          proprietario: "Maria Silva",
          createdAt: new Date(2023, 0, 15).toISOString(),
          updatedAt: new Date(2023, 0, 15).toISOString(),
        },
        {
          id: "2",
          nome: "Salém",
          especie: "GATO",
          raca: "Vira-lata",
          cor: "Preto",
          porte: "PEQUENO",
          dataNascimento: new Date(2021, 8, 10).toISOString(),
          vacinado: true,
          fotoUrl: "/images/salem.jpg",
          observacoes: "Assustado com barulhos altos",
          bloco: "B",
          apartamento: "201",
          proprietario: "João Santos",
          createdAt: new Date(2023, 2, 20).toISOString(),
          updatedAt: new Date(2023, 2, 20).toISOString(),
        },
        {
          id: "3",
          nome: "Thor",
          especie: "CAO",
          raca: "Pastor Alemão",
          cor: "Preto e marrom",
          porte: "GRANDE",
          dataNascimento: new Date(2019, 11, 5).toISOString(),
          vacinado: true,
          fotoUrl: "/images/thor.jpg",
          observacoes: "Protetor e ativo",
          bloco: "C",
          apartamento: "101",
          proprietario: "Ana Oliveira",
          createdAt: new Date(2022, 11, 10).toISOString(),
          updatedAt: new Date(2022, 11, 10).toISOString(),
        },
        {
          id: "4",
          nome: "Luna",
          especie: "GATO",
          raca: "Siamês",
          cor: "Branco com manchas castanhas",
          porte: "MEDIO",
          dataNascimento: new Date(2022, 2, 22).toISOString(),
          vacinado: true,
          fotoUrl: "/images/luna.jpg",
          observacoes: "Gosta de carinho e atenção",
          bloco: "A",
          apartamento: "401",
          proprietario: "Carlos Mendes",
          createdAt: new Date(2023, 5, 5).toISOString(),
          updatedAt: new Date(2023, 5, 5).toISOString(),
        }
      ];
      
      // Simulando tempo de carregamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setList(mockData);
      setTotal(mockData.length);
    } catch (err) {
      console.error("Erro ao carregar pets:", err);
      push({ title: "Erro", message: "Falha de conexão ao carregar pets", kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [queryString, push]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (pet?: Pet) => {
    if (pet) {
      setEditingPet(pet);
      setFormData({
        nome: pet.nome,
        especie: pet.especie,
        raca: pet.raca,
        cor: pet.cor,
        porte: pet.porte,
        dataNascimento: pet.dataNascimento ? pet.dataNascimento.split('T')[0] : "",
        vacinado: pet.vacinado,
        fotoUrl: pet.fotoUrl || "",
        observacoes: pet.observacoes || "",
        bloco: pet.bloco,
        apartamento: pet.apartamento,
        proprietario: pet.proprietario,
      });
    } else {
      setEditingPet(null);
      setFormData(initialFormData);
    }
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPet(null);
    setFormData(initialFormData);
    setError("");
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.bloco.trim() || !formData.apartamento.trim() || !formData.proprietario.trim()) {
      setError("Nome, bloco, apartamento e proprietário são obrigatórios.");
      return;
    }

    const payload = {
      ...formData,
      nome: formData.nome.trim(),
      bloco: formData.bloco.toUpperCase(),
      apartamento: formData.apartamento.toUpperCase(),
      proprietario: formData.proprietario.trim(),
    };

    setSaving(true);
    setError("");

    try {
      // Simulando chamada à API
      // const url = editingPet ? `/api/pets/${editingPet.id}` : "/api/pets";
      // const method = editingPet ? "PUT" : "POST";

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
          title: editingPet ? "Pet atualizado!" : "Pet cadastrado!", 
          message: `O pet "${payload.nome}" foi ${editingPet ? 'atualizado' : 'cadastrado'} com sucesso.`,
          kind: "success" 
        });
      } else {
        setError("Erro ao salvar pet.");
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
      // const response = await fetch(`/api/pets/${deleteConfirm.id}`, {
      //   method: "DELETE",
      // });

      // const data = await response.json();

      // Simulando resposta positiva
      await new Promise(resolve => setTimeout(resolve, 600));
      
      if (true) { // Simulando sucesso
        setDeleteConfirm(null);
        await load();
        push({ 
          title: "Pet excluído!", 
          message: `O pet "${deleteConfirm.nome}" foi excluído com sucesso.`,
          kind: "success" 
        });
      } else {
        push({ title: "Erro", message: "Erro ao excluir pet.", kind: "error" });
      }
    } catch (err) {
      push({ title: "Erro", message: "Falha de conexão ao excluir pet.", kind: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterEspecie("");
    setFilterPorte("");
    setFilterBloco("");
    setFilterSearch("");
    setPage(1);
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Species icon
  const getSpeciesIcon = (especie: string) => {
    switch (especie) {
      case "CAO":
        return <Dog className="w-5 h-5 text-amber-400" />;
      case "GATO":
        return <Cat className="w-5 h-5 text-emerald-400" />;
      case "PASSARO":
        return <Heart className="w-5 h-5 text-rose-400" />;
      default:
        return <Bone className="w-5 h-5 text-slate-400" />;
    }
  };

  // Size badge
  const getSizeBadge = (porte: string) => {
    switch (porte) {
      case "PEQUENO":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">Pequeno</span>;
      case "MEDIO":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300">Médio</span>;
      case "GRANDE":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300">Grande</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300">Desconhecido</span>;
    }
  };

  // Vaccination status
  const getVaccinationStatus = (vacinado: boolean) => {
    return vacinado ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">
        <Syringe className="w-3 h-3" />
        Vacinado
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300">
        <FileText className="w-3 h-3" />
        Não vacinado
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {getSpeciesIcon("CAO")}
            Cadastro de Pets
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie os animais de estimação do condomínio
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-amber-500/25"
        >
          <Plus className="w-5 h-5" />
          Novo Pet
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
                placeholder="Nome ou raça..."
                className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Espécie</label>
            <select 
              value={filterEspecie}
              onChange={(e) => { setFilterEspecie(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
            >
              <option value="">Todas</option>
              <option value="CAO">Cachorro</option>
              <option value="GATO">Gato</option>
              <option value="PASSARO">Pássaro</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Porte</label>
            <select 
              value={filterPorte}
              onChange={(e) => { setFilterPorte(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
            >
              <option value="">Todos</option>
              <option value="PEQUENO">Pequeno</option>
              <option value="MEDIO">Médio</option>
              <option value="GRANDE">Grande</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Bloco</label>
            <select 
              value={filterBloco}
              onChange={(e) => { setFilterBloco(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
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
                <th className="text-left py-3 px-4 font-medium text-slate-300">Pet</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Espécie</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Raça</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Porte</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Vacinação</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Unidade</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Proprietário</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300 w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                      Carregando pets...
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {getSpeciesIcon("CAO")}
                    <div className="mt-3">Nenhum pet encontrado.</div>
                  </td>
                </tr>
              ) : (
                list.map((pet) => (
                  <tr
                    key={pet.id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                          {getSpeciesIcon(pet.especie)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">{pet.nome}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Utensils className="w-3 h-3" />
                            {pet.cor}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {getSpeciesIcon(pet.especie)}
                        <span className="capitalize">{pet.especie.toLowerCase()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {pet.raca || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {getSizeBadge(pet.porte)}
                    </td>
                    <td className="py-3 px-4">
                      {getVaccinationStatus(pet.vacinado)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {pet.bloco} - {pet.apartamento}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {pet.proprietario}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openModal(pet)}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(pet)}
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
              Mostrando {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} de {total} pets
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
                {getSpeciesIcon(editingPet?.especie || "CAO")}
                {editingPet ? "Editar Pet" : "Novo Pet"}
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
                    Nome do Pet <span className="text-amber-400">*</span>
                  </label>
                  <input
                    value={formData.nome}
                    onChange={(e) => handleInputChange("nome", e.target.value)}
                    placeholder="Nome do animal"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Espécie <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={formData.especie}
                    onChange={(e) => handleInputChange("especie", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                  >
                    <option value="CAO">Cachorro</option>
                    <option value="GATO">Gato</option>
                    <option value="PASSARO">Pássaro</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Raça
                  </label>
                  <input
                    value={formData.raca}
                    onChange={(e) => handleInputChange("raca", e.target.value)}
                    placeholder="Raça do animal"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Cor
                  </label>
                  <input
                    value={formData.cor}
                    onChange={(e) => handleInputChange("cor", e.target.value)}
                    placeholder="Cor do animal"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Porte
                  </label>
                  <select
                    value={formData.porte}
                    onChange={(e) => handleInputChange("porte", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                  >
                    <option value="PEQUENO">Pequeno</option>
                    <option value="MEDIO">Médio</option>
                    <option value="GRANDE">Grande</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) => handleInputChange("dataNascimento", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                  />
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.vacinado}
                      onChange={(e) => handleInputChange("vacinado", e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500/20"
                    />
                    <span className="ml-2 text-sm text-slate-300">Vacinado</span>
                  </label>
                </div>
                
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Bloco <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={formData.bloco}
                    onChange={(e) => handleInputChange("bloco", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
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
                    Apartamento <span className="text-amber-400">*</span>
                  </label>
                  <input
                    value={formData.apartamento}
                    onChange={(e) => handleInputChange("apartamento", e.target.value)}
                    placeholder="Número do apartamento"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Proprietário <span className="text-amber-400">*</span>
                  </label>
                  <input
                    value={formData.proprietario}
                    onChange={(e) => handleInputChange("proprietario", e.target.value)}
                    placeholder="Nome do proprietário"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    URL da Foto
                  </label>
                  <input
                    value={formData.fotoUrl}
                    onChange={(e) => handleInputChange("fotoUrl", e.target.value)}
                    placeholder="https://exemplo.com/foto-pet.jpg"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange("observacoes", e.target.value)}
                    placeholder="Comportamento, alimentação especial, etc."
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition resize-none"
                  />
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
                      <>{editingPet ? "Salvar Alterações" : "Cadastrar Pet"}</>
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
                Excluir Pet?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Deseja realmente excluir o pet{" "}
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