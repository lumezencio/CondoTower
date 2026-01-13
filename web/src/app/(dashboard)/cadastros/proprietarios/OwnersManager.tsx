"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Crown,
  KeyRound,
  Plus,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Building2,
  User,
  MapPin,
  FileText,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  CreditCard,
  AlertTriangle,
  Loader2,
} from "lucide-react";

type OwnerType = "PROPRIETARIO" | "INQUILINO";

type Unit = {
  id: string;
  block: string;
  number: string;
};

type Owner = {
  id: string;
  unitId: string;
  unit: Unit;
  type: OwnerType;
  name: string;
  cpf: string;
  rg: string | null;
  phone: string | null;
  phone2: string | null;
  email: string | null;
  birthDate: string | null;
  profession: string | null;
  billingStreet: string | null;
  billingNumber: string | null;
  billingComplement: string | null;
  billingNeighborhood: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingZip: string | null;
  contractStart: string | null;
  contractEnd: string | null;
  rentValue: number | null;
  notes: string | null;
};

type FormData = {
  unitId: string;
  type: OwnerType;
  name: string;
  cpf: string;
  rg: string;
  phone: string;
  phone2: string;
  email: string;
  birthDate: string;
  profession: string;
  billingStreet: string;
  billingNumber: string;
  billingComplement: string;
  billingNeighborhood: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  contractStart: string;
  contractEnd: string;
  rentValue: string;
  notes: string;
};

const EMPTY_FORM: FormData = {
  unitId: "",
  type: "PROPRIETARIO",
  name: "",
  cpf: "",
  rg: "",
  phone: "",
  phone2: "",
  email: "",
  birthDate: "",
  profession: "",
  billingStreet: "",
  billingNumber: "",
  billingComplement: "",
  billingNeighborhood: "",
  billingCity: "",
  billingState: "",
  billingZip: "",
  contractStart: "",
  contractEnd: "",
  rentValue: "",
  notes: "",
};

const TYPE_LABELS: Record<OwnerType, string> = {
  PROPRIETARIO: "Proprietario",
  INQUILINO: "Inquilino",
};

const TYPE_COLORS: Record<OwnerType, string> = {
  PROPRIETARIO: "text-amber-400 bg-amber-500/20",
  INQUILINO: "text-blue-400 bg-blue-500/20",
};

const TYPE_ICONS: Record<OwnerType, React.ComponentType<{ className?: string }>> = {
  PROPRIETARIO: Crown,
  INQUILINO: KeyRound,
};

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

// Formatadores
function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
}

function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

function formatCEP(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 8);
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
}

function formatCurrency(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (!numbers) return "";
  const num = parseInt(numbers, 10) / 100;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseCurrency(value: string): number | null {
  const numbers = value.replace(/\D/g, "");
  if (!numbers) return null;
  return parseInt(numbers, 10) / 100;
}

export default function OwnersManager() {
  // Estados principais
  const [list, setList] = useState<Owner[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  // Unidades para select
  const [units, setUnits] = useState<Unit[]>([]);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState<"dados" | "endereco" | "contrato">("dados");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState<Owner | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filtros
  const [filterBlock, setFilterBlock] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterName, setFilterName] = useState("");

  // Busca CEP
  const [loadingCep, setLoadingCep] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  // Carregar unidades
  useEffect(() => {
    fetch("/api/units?pageSize=1000")
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) setUnits(res.data || []);
      });
  }, []);

  // Carregar lista
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (filterBlock) params.set("block", filterBlock);
      if (filterType) params.set("type", filterType);
      if (filterName) params.set("name", filterName);

      const res = await fetch(`/api/owners?${params}`);
      const json = await res.json();
      if (json.ok) {
        setList(json.data || []);
        setTotal(json.total || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterBlock, filterType, filterName]);

  useEffect(() => {
    load();
  }, [load]);

  // Blocos unicos para filtro
  const uniqueBlocks = [...new Set(units.map((u) => u.block))].sort();

  // Abrir modal
  const openModal = (owner?: Owner) => {
    if (owner) {
      setEditingOwner(owner);
      setFormData({
        unitId: owner.unitId,
        type: owner.type,
        name: owner.name,
        cpf: formatCPF(owner.cpf),
        rg: owner.rg || "",
        phone: owner.phone ? formatPhone(owner.phone) : "",
        phone2: owner.phone2 ? formatPhone(owner.phone2) : "",
        email: owner.email || "",
        birthDate: owner.birthDate ? owner.birthDate.split("T")[0] : "",
        profession: owner.profession || "",
        billingStreet: owner.billingStreet || "",
        billingNumber: owner.billingNumber || "",
        billingComplement: owner.billingComplement || "",
        billingNeighborhood: owner.billingNeighborhood || "",
        billingCity: owner.billingCity || "",
        billingState: owner.billingState || "",
        billingZip: owner.billingZip ? formatCEP(owner.billingZip) : "",
        contractStart: owner.contractStart ? owner.contractStart.split("T")[0] : "",
        contractEnd: owner.contractEnd ? owner.contractEnd.split("T")[0] : "",
        rentValue: owner.rentValue ? formatCurrency(String(owner.rentValue * 100)) : "",
        notes: owner.notes || "",
      });
    } else {
      setEditingOwner(null);
      setFormData(EMPTY_FORM);
    }
    setActiveTab("dados");
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOwner(null);
    setFormData(EMPTY_FORM);
    setError("");
    setActiveTab("dados");
  };

  // Input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setError("");

    if (name === "cpf") {
      setFormData((prev) => ({ ...prev, cpf: formatCPF(value) }));
    } else if (name === "phone" || name === "phone2") {
      setFormData((prev) => ({ ...prev, [name]: formatPhone(value) }));
    } else if (name === "billingZip") {
      setFormData((prev) => ({ ...prev, billingZip: formatCEP(value) }));
    } else if (name === "rentValue") {
      setFormData((prev) => ({ ...prev, rentValue: formatCurrency(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Buscar CEP
  const searchCep = async () => {
    const cep = formData.billingZip.replace(/\D/g, "");
    if (cep.length !== 8) return;

    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          billingStreet: data.logradouro?.toUpperCase() || "",
          billingNeighborhood: data.bairro?.toUpperCase() || "",
          billingCity: data.localidade?.toUpperCase() || "",
          billingState: data.uf?.toUpperCase() || "",
        }));
      }
    } catch {
      // Ignore errors
    } finally {
      setLoadingCep(false);
    }
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.unitId) {
      setError("Selecione uma unidade.");
      setActiveTab("dados");
      return;
    }

    if (!formData.name.trim()) {
      setError("Nome e obrigatorio.");
      setActiveTab("dados");
      return;
    }

    const cpfNumbers = formData.cpf.replace(/\D/g, "");
    if (cpfNumbers.length !== 11) {
      setError("CPF deve ter 11 digitos.");
      setActiveTab("dados");
      return;
    }

    const payload = {
      unitId: formData.unitId,
      type: formData.type,
      name: formData.name.trim().toUpperCase(),
      cpf: cpfNumbers,
      rg: formData.rg.trim().toUpperCase() || null,
      phone: formData.phone.replace(/\D/g, "") || null,
      phone2: formData.phone2.replace(/\D/g, "") || null,
      email: formData.email.trim().toUpperCase() || null,
      birthDate: formData.birthDate || null,
      profession: formData.profession.trim().toUpperCase() || null,
      billingStreet: formData.billingStreet.trim().toUpperCase() || null,
      billingNumber: formData.billingNumber.trim().toUpperCase() || null,
      billingComplement: formData.billingComplement.trim().toUpperCase() || null,
      billingNeighborhood: formData.billingNeighborhood.trim().toUpperCase() || null,
      billingCity: formData.billingCity.trim().toUpperCase() || null,
      billingState: formData.billingState.trim().toUpperCase() || null,
      billingZip: formData.billingZip.replace(/\D/g, "") || null,
      contractStart: formData.contractStart || null,
      contractEnd: formData.contractEnd || null,
      rentValue: parseCurrency(formData.rentValue),
      notes: formData.notes.trim().toUpperCase() || null,
    };

    setSaving(true);
    try {
      const url = editingOwner ? `/api/owners/${editingOwner.id}` : "/api/owners";
      const method = editingOwner ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.ok) {
        setError(json.message || "Erro ao salvar");
        return;
      }

      closeModal();
      load();
    } catch (err: any) {
      setError(err?.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/owners/${deleteConfirm.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.ok) {
        setDeleteConfirm(null);
        load();
      }
    } finally {
      setDeleting(false);
    }
  };

  // Limpar filtros
  const clearFilters = () => {
    setFilterBlock("");
    setFilterType("");
    setFilterName("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Crown className="w-7 h-7 text-amber-400" />
            Proprietarios e Inquilinos
          </h1>
          <p className="text-slate-400 mt-1">
            Cadastro de proprietarios e inquilinos das unidades
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-5 h-5" />
          Novo Cadastro
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Bloco</label>
            <select
              value={filterBlock}
              onChange={(e) => {
                setFilterBlock(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-700/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="">Todos</option>
              {uniqueBlocks.map((b) => (
                <option key={b} value={b}>
                  Bloco {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Tipo</label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-700/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="">Todos</option>
              <option value="PROPRIETARIO">Proprietario</option>
              <option value="INQUILINO">Inquilino</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Nome</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={filterName}
                onChange={(e) => {
                  setFilterName(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por nome..."
                className="w-full bg-slate-700/50 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full bg-slate-700/50 hover:bg-slate-600/50 border border-white/10 rounded-lg px-4 py-2 text-slate-300 transition"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/50">
                <th className="text-left text-sm font-semibold text-slate-300 px-4 py-3">
                  Unidade
                </th>
                <th className="text-left text-sm font-semibold text-slate-300 px-4 py-3">
                  Tipo
                </th>
                <th className="text-left text-sm font-semibold text-slate-300 px-4 py-3">
                  Nome
                </th>
                <th className="text-left text-sm font-semibold text-slate-300 px-4 py-3">
                  CPF
                </th>
                <th className="text-left text-sm font-semibold text-slate-300 px-4 py-3">
                  Telefone
                </th>
                <th className="text-left text-sm font-semibold text-slate-300 px-4 py-3">
                  Email
                </th>
                <th className="text-right text-sm font-semibold text-slate-300 px-4 py-3">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    Nenhum registro encontrado
                  </td>
                </tr>
              ) : (
                list.map((owner) => {
                  const TypeIcon = TYPE_ICONS[owner.type];
                  return (
                    <tr
                      key={owner.id}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-indigo-400" />
                          <span className="text-white font-medium">
                            {owner.unit.block}-{owner.unit.number}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[owner.type]}`}
                        >
                          <TypeIcon className="w-3.5 h-3.5" />
                          {TYPE_LABELS[owner.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white">{owner.name}</td>
                      <td className="px-4 py-3 text-slate-300 font-mono text-sm">
                        {formatCPF(owner.cpf)}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {owner.phone ? formatPhone(owner.phone) : "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-sm">
                        {owner.email || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openModal(owner)}
                            title="Editar"
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(owner)}
                            title="Excluir"
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
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

        {/* Paginacao */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <div className="text-sm text-slate-400">
              Pagina {page} de {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                title="Pagina anterior"
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
                if (pageNum < 1 || pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                      page === pageNum
                        ? "bg-amber-500 text-white"
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
                title="Proxima pagina"
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edicao */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-slate-900 rounded-2xl border border-white/10 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                {editingOwner ? "Editar Cadastro" : "Novo Cadastro"}
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

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("dados")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
                  activeTab === "dados"
                    ? "text-amber-400 border-amber-400"
                    : "text-slate-400 border-transparent hover:text-white"
                }`}
              >
                <User className="w-4 h-4" />
                Dados Pessoais
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("endereco")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
                  activeTab === "endereco"
                    ? "text-amber-400 border-amber-400"
                    : "text-slate-400 border-transparent hover:text-white"
                }`}
              >
                <MapPin className="w-4 h-4" />
                Endereco Cobranca
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("contrato")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
                  activeTab === "contrato"
                    ? "text-amber-400 border-amber-400"
                    : "text-slate-400 border-transparent hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4" />
                Contrato
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Tab: Dados Pessoais */}
              {activeTab === "dados" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">
                        Unidade *
                      </label>
                      <select
                        name="unitId"
                        value={formData.unitId}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      >
                        <option value="">Selecione...</option>
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>
                            Bloco {u.block} - {u.number}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">
                        Tipo *
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      >
                        <option value="PROPRIETARIO">Proprietario</option>
                        <option value="INQUILINO">Inquilino</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Nome completo"
                        className="w-full bg-slate-800 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">
                        CPF *
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          name="cpf"
                          value={formData.cpf}
                          onChange={handleInputChange}
                          required
                          placeholder="000.000.000-00"
                          className="w-full bg-slate-800 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">
                        RG
                      </label>
                      <input
                        type="text"
                        name="rg"
                        value={formData.rg}
                        onChange={handleInputChange}
                        placeholder="RG"
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">
                        Telefone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="(00) 00000-0000"
                          className="w-full bg-slate-800 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">
                        Telefone 2
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          name="phone2"
                          value={formData.phone2}
                          onChange={handleInputChange}
                          placeholder="(00) 00000-0000"
                          className="w-full bg-slate-800 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@exemplo.com"
                        className="w-full bg-slate-800 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">
                        Data de Nascimento
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="date"
                          name="birthDate"
                          value={formData.birthDate}
                          onChange={handleInputChange}
                          className="w-full bg-slate-800 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">
                        Profissao
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          name="profession"
                          value={formData.profession}
                          onChange={handleInputChange}
                          placeholder="Profissao"
                          className="w-full bg-slate-800 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Endereco de Cobranca */}
              {activeTab === "endereco" && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm">
                    Endereco para envio de boletos e correspondencias (se diferente da unidade)
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm text-slate-400 mb-1">
                        CEP
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="billingZip"
                          value={formData.billingZip}
                          onChange={handleInputChange}
                          placeholder="00000-000"
                          className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
                        />
                        <button
                          type="button"
                          onClick={searchCep}
                          disabled={loadingCep || formData.billingZip.replace(/\D/g, "").length !== 8}
                          className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingCep ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3">
                      <label className="block text-sm text-slate-400 mb-1">
                        Rua
                      </label>
                      <input
                        type="text"
                        name="billingStreet"
                        value={formData.billingStreet}
                        onChange={handleInputChange}
                        placeholder="Rua, Avenida..."
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">
                        Numero
                      </label>
                      <input
                        type="text"
                        name="billingNumber"
                        value={formData.billingNumber}
                        onChange={handleInputChange}
                        placeholder="N"
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">
                        Complemento
                      </label>
                      <input
                        type="text"
                        name="billingComplement"
                        value={formData.billingComplement}
                        onChange={handleInputChange}
                        placeholder="Apto, Sala..."
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">
                        Bairro
                      </label>
                      <input
                        type="text"
                        name="billingNeighborhood"
                        value={formData.billingNeighborhood}
                        onChange={handleInputChange}
                        placeholder="Bairro"
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm text-slate-400 mb-1">
                        Cidade
                      </label>
                      <input
                        type="text"
                        name="billingCity"
                        value={formData.billingCity}
                        onChange={handleInputChange}
                        placeholder="Cidade"
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">
                        Estado
                      </label>
                      <select
                        name="billingState"
                        value={formData.billingState}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      >
                        <option value="">UF</option>
                        {ESTADOS.map((uf) => (
                          <option key={uf} value={uf}>
                            {uf}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Contrato */}
              {activeTab === "contrato" && (
                <div className="space-y-4">
                  {formData.type === "PROPRIETARIO" ? (
                    <div className="p-4 bg-slate-800/50 border border-white/10 rounded-lg text-slate-400 text-center">
                      <Crown className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                      <p>Dados de contrato sao apenas para inquilinos.</p>
                      <p className="text-sm mt-1">
                        Se a unidade estiver alugada, cadastre um inquilino.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm">
                        Dados do contrato de locacao
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-slate-400 mb-1">
                            Inicio do Contrato
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="date"
                              name="contractStart"
                              value={formData.contractStart}
                              onChange={handleInputChange}
                              className="w-full bg-slate-800 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-1">
                            Fim do Contrato
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="date"
                              name="contractEnd"
                              value={formData.contractEnd}
                              onChange={handleInputChange}
                              className="w-full bg-slate-800 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-slate-400 mb-1">
                          Valor do Aluguel (R$)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            R$
                          </span>
                          <input
                            type="text"
                            name="rentValue"
                            value={formData.rentValue}
                            onChange={handleInputChange}
                            placeholder="0,00"
                            className="w-full bg-slate-800 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">
                      Observacoes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Observacoes adicionais..."
                      className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                    />
                  </div>
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingOwner ? "Salvar" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmacao de Delete */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-slate-900 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Confirmar Exclusao
                </h3>
                <p className="text-slate-400 text-sm">
                  Esta acao nao pode ser desfeita
                </p>
              </div>
            </div>

            <p className="text-slate-300 mb-6">
              Deseja realmente excluir{" "}
              <span className="font-semibold text-white">
                {deleteConfirm.name}
              </span>{" "}
              ({TYPE_LABELS[deleteConfirm.type]}) da unidade{" "}
              <span className="font-semibold text-white">
                {deleteConfirm.unit.block}-{deleteConfirm.unit.number}
              </span>
              ?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
