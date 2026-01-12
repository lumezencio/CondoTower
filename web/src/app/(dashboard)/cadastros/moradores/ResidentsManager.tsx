"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Plus, Search, Edit2, Trash2, X, Users, Building2, Home,
  Phone, Mail, CreditCard, Calendar, ChevronLeft, ChevronRight,
  Crown, User, UserCheck, UserCog, Heart
} from "lucide-react";

type Unit = {
  id: string;
  block: string;
  number: string;
};

type Resident = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  role: ResidentRole;
  isOwner: boolean;
  birthDate: string | null;
  unitId: string;
  unit: Unit;
  createdAt?: string;
};

type ResidentRole = "PROPRIETARIO" | "INQUILINO" | "FAMILIAR" | "MORADOR" | "SINDICO";

type FormData = {
  unitId: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  role: ResidentRole;
  isOwner: boolean;
  birthDate: string;
};

const initialFormData: FormData = {
  unitId: "",
  name: "",
  email: "",
  phone: "",
  cpf: "",
  role: "MORADOR",
  isOwner: false,
  birthDate: "",
};

const ROLE_LABELS: Record<ResidentRole, string> = {
  PROPRIETARIO: "Proprietário",
  INQUILINO: "Inquilino",
  FAMILIAR: "Familiar",
  MORADOR: "Morador",
  SINDICO: "Síndico",
};

const ROLE_COLORS: Record<ResidentRole, string> = {
  PROPRIETARIO: "text-amber-400 bg-amber-500/20",
  INQUILINO: "text-blue-400 bg-blue-500/20",
  FAMILIAR: "text-pink-400 bg-pink-500/20",
  MORADOR: "text-emerald-400 bg-emerald-500/20",
  SINDICO: "text-purple-400 bg-purple-500/20",
};

const ROLE_ICONS: Record<ResidentRole, React.ComponentType<{ className?: string }>> = {
  PROPRIETARIO: Crown,
  INQUILINO: UserCheck,
  FAMILIAR: Heart,
  MORADOR: User,
  SINDICO: UserCog,
};

export default function ResidentsManager() {
  const [list, setList] = useState<Resident[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Lista de unidades para o select
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Filtros
  const [filterName, setFilterName] = useState("");
  const [filterBlock, setFilterBlock] = useState("");
  const [filterRole, setFilterRole] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Resident | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  // Carregar unidades
  useEffect(() => {
    async function loadUnits() {
      setLoadingUnits(true);
      try {
        const response = await fetch("/api/units?pageSize=1000");
        const data = await response.json();
        if (data?.ok) {
          setUnits(data.data ?? []);
        }
      } catch (err) {
        console.error("Erro ao carregar unidades:", err);
      } finally {
        setLoadingUnits(false);
      }
    }
    loadUnits();
  }, []);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filterName.trim()) params.set("name", filterName.trim());
    if (filterBlock.trim()) params.set("block", filterBlock.trim());
    if (filterRole) params.set("role", filterRole);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [filterName, filterBlock, filterRole, page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/residents?${queryString}`, { cache: "no-store" });
      const data = await response.json();
      if (data?.ok) {
        setList(data.data ?? []);
        setTotal(data.total ?? 0);
      }
    } catch (err) {
      console.error("Erro ao carregar moradores:", err);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (resident?: Resident) => {
    if (resident) {
      setEditingResident(resident);
      setFormData({
        unitId: resident.unitId,
        name: resident.name,
        email: resident.email ?? "",
        phone: resident.phone ?? "",
        cpf: resident.cpf ?? "",
        role: resident.role,
        isOwner: resident.isOwner,
        birthDate: resident.birthDate ? resident.birthDate.split("T")[0] : "",
      });
    } else {
      setEditingResident(null);
      setFormData(initialFormData);
    }
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingResident(null);
    setFormData(initialFormData);
    setError("");
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  // Formatar CPF enquanto digita
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  };

  // Formatar telefone enquanto digita
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.unitId) {
      setError("Selecione a unidade.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Nome é obrigatório.");
      return;
    }

    const payload = {
      unitId: formData.unitId,
      name: formData.name.trim().toUpperCase(),
      email: formData.email.trim().toUpperCase() || null,
      phone: formData.phone.replace(/\D/g, "") || null,
      cpf: formData.cpf.replace(/\D/g, "") || null,
      role: formData.role,
      isOwner: formData.isOwner,
      birthDate: formData.birthDate || null,
    };

    setSaving(true);
    setError("");

    try {
      const url = editingResident ? `/api/residents/${editingResident.id}` : "/api/residents";
      const method = editingResident ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data?.ok) {
        closeModal();
        await load();
      } else {
        setError(data?.message ?? "Erro ao salvar morador.");
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
      const response = await fetch(`/api/residents/${deleteConfirm.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data?.ok) {
        setDeleteConfirm(null);
        await load();
      } else {
        alert(data?.message ?? "Erro ao excluir morador.");
      }
    } catch (err) {
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterName("");
    setFilterBlock("");
    setFilterRole("");
    setPage(1);
  };

  // Agrupar unidades por bloco para o select
  const unitsByBlock = useMemo(() => {
    const grouped: Record<string, Unit[]> = {};
    units.forEach((unit) => {
      if (!grouped[unit.block]) grouped[unit.block] = [];
      grouped[unit.block].push(unit);
    });
    // Ordenar unidades dentro de cada bloco
    Object.keys(grouped).forEach((block) => {
      grouped[block].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
    });
    return grouped;
  }, [units]);

  const blocksOrdered = Object.keys(unitsByBlock).sort();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-emerald-400" />
            Cadastro de Moradores
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Proprietários, inquilinos e familiares
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/25"
        >
          <Plus className="w-5 h-5" />
          Novo Morador
        </button>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">Filtros</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Nome</label>
            <input
              value={filterName}
              onChange={(e) => { setFilterName(e.target.value); setPage(1); }}
              placeholder="Buscar por nome..."
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 placeholder-slate-500 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Bloco</label>
            <select
              value={filterBlock}
              onChange={(e) => { setFilterBlock(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
            >
              <option value="">Todos</option>
              {blocksOrdered.map((block) => (
                <option key={block} value={block}>Bloco {block}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tipo</label>
            <select
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
            >
              <option value="">Todos</option>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              Limpar
            </button>
            <div className="text-sm text-slate-400 ml-auto self-center">
              {total} morador{total !== 1 ? "es" : ""} encontrado{total !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left py-3 px-4 font-medium text-slate-300">Nome</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Unidade</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Tipo</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Contato</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">CPF</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300 w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      Carregando...
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    Nenhum morador encontrado.
                  </td>
                </tr>
              ) : (
                list.map((resident) => {
                  const RoleIcon = ROLE_ICONS[resident.role];
                  return (
                    <tr
                      key={resident.id}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                            {resident.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-slate-100 font-medium">{resident.name}</div>
                            {resident.isOwner && (
                              <span className="text-xs text-amber-400">Responsável</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs">
                            <Building2 className="w-3 h-3" />
                            {resident.unit.block}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-500/20 text-slate-300 rounded text-xs">
                            <Home className="w-3 h-3" />
                            {resident.unit.number}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${ROLE_COLORS[resident.role]}`}>
                          <RoleIcon className="w-3.5 h-3.5" />
                          {ROLE_LABELS[resident.role]}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {resident.phone && (
                            <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                              <Phone className="w-3 h-3 text-slate-500" />
                              {formatPhone(resident.phone)}
                            </div>
                          )}
                          {resident.email && (
                            <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                              <Mail className="w-3 h-3 text-slate-500" />
                              {resident.email}
                            </div>
                          )}
                          {!resident.phone && !resident.email && (
                            <span className="text-slate-500 text-xs">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-xs">
                        {resident.cpf ? formatCPF(resident.cpf) : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => openModal(resident)}
                            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(resident)}
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
              Página {page} de {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                title="Página anterior"
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
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                title="Próxima página"
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
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-slate-900 z-10">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                {editingResident ? "Editar Morador" : "Novo Morador"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
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

              <div className="space-y-4">
                {/* Unidade */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Unidade <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.unitId}
                    onChange={(e) => handleInputChange("unitId", e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  >
                    <option value="">Selecione a unidade...</option>
                    {blocksOrdered.map((block) => (
                      <optgroup key={block} label={`Bloco ${block}`}>
                        {unitsByBlock[block].map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            Bloco {unit.block} - Apto {unit.number}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Nome */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Nome Completo <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nome do morador"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    autoFocus
                  />
                </div>

                {/* Tipo/Role */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Tipo de Morador <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(ROLE_LABELS) as [ResidentRole, string][]).map(([value, label]) => {
                      const Icon = ROLE_ICONS[value];
                      const isSelected = formData.role === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleInputChange("role", value)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition text-sm ${
                            isSelected
                              ? `border-emerald-500 ${ROLE_COLORS[value]}`
                              : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Responsável */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isOwner}
                      onChange={(e) => handleInputChange("isOwner", e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-slate-800 text-emerald-500 focus:ring-emerald-500/20"
                    />
                    <span className="text-sm text-slate-300">
                      Responsável pela unidade (recebe comunicados)
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="email@exemplo.com"
                        className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </div>
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Telefone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", formatPhone(e.target.value))}
                        placeholder="(00) 00000-0000"
                        className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </div>
                  </div>

                  {/* CPF */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">CPF</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        value={formData.cpf}
                        onChange={(e) => handleInputChange("cpf", formatCPF(e.target.value))}
                        placeholder="000.000.000-00"
                        className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </div>
                  </div>

                  {/* Data de Nascimento */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Data de Nascimento</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 pl-10 pr-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </div>
                  </div>
                </div>
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
                  className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>{editingResident ? "Salvar Alterações" : "Cadastrar Morador"}</>
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
              <h3 className="text-lg font-semibold text-white mb-2">
                Excluir Morador?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Deseja realmente excluir{" "}
                <span className="text-white font-medium">{deleteConfirm.name}</span>
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
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
