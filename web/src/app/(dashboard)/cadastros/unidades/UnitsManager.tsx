"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Search, Edit2, Trash2, X, Building2, Home, Users, Car, FileText, ChevronLeft, ChevronRight } from "lucide-react";

type Unit = {
  id: string;
  block: string;
  number: string;
  areaM2: number | null;
  bedrooms: number | null;
  parkingSpots: number | null;
  notes: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    residents: number;
    vehicles: number;
  };
};

type FormData = {
  block: string;
  number: string;
  areaM2: string;
  bedrooms: string;
  parkingSpots: string;
  notes: string;
};

const initialFormData: FormData = {
  block: "",
  number: "",
  areaM2: "",
  bedrooms: "",
  parkingSpots: "",
  notes: "",
};

export default function UnitsManager() {
  const [list, setList] = useState<Unit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Filtros
  const [filterBlock, setFilterBlock] = useState("");
  const [filterNumber, setFilterNumber] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Unit | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filterBlock.trim()) params.set("block", filterBlock.trim());
    if (filterNumber.trim()) params.set("number", filterNumber.trim());
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [filterBlock, filterNumber, page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/units?${queryString}`, { cache: "no-store" });
      const data = await response.json();
      if (data?.ok) {
        setList(data.data ?? []);
        setTotal(data.total ?? 0);
      }
    } catch (err) {
      console.error("Erro ao carregar unidades:", err);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({
        block: unit.block,
        number: unit.number,
        areaM2: unit.areaM2?.toString() ?? "",
        bedrooms: unit.bedrooms?.toString() ?? "",
        parkingSpots: unit.parkingSpots?.toString() ?? "",
        notes: unit.notes ?? "",
      });
    } else {
      setEditingUnit(null);
      setFormData(initialFormData);
    }
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUnit(null);
    setFormData(initialFormData);
    setError("");
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    if (!formData.block.trim() || !formData.number.trim()) {
      setError("Bloco e Número são obrigatórios.");
      return;
    }

    const payload = {
      block: formData.block.trim().toUpperCase(),
      number: formData.number.trim().toUpperCase(),
      areaM2: formData.areaM2 ? parseFloat(formData.areaM2) : null,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
      parkingSpots: formData.parkingSpots ? parseInt(formData.parkingSpots) : null,
      notes: formData.notes.trim().toUpperCase() || null,
    };

    setSaving(true);
    setError("");

    try {
      const url = editingUnit ? `/api/units/${editingUnit.id}` : "/api/units";
      const method = editingUnit ? "PUT" : "POST";

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
        setError(data?.message ?? "Erro ao salvar unidade.");
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
      const response = await fetch(`/api/units/${deleteConfirm.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data?.ok) {
        setDeleteConfirm(null);
        await load();
      } else {
        alert(data?.message ?? "Erro ao excluir unidade.");
      }
    } catch (err) {
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterBlock("");
    setFilterNumber("");
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Building2 className="w-7 h-7 text-indigo-400" />
            Cadastro de Unidades
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie as unidades do condomínio
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-5 h-5" />
          Nova Unidade
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
            <label className="text-xs text-slate-400 mb-1 block">Bloco</label>
            <input
              value={filterBlock}
              onChange={(e) => { setFilterBlock(e.target.value); setPage(1); }}
              placeholder="Ex.: A"
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 placeholder-slate-500 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Número/Apto</label>
            <input
              value={filterNumber}
              onChange={(e) => { setFilterNumber(e.target.value); setPage(1); }}
              placeholder="Ex.: 101"
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 placeholder-slate-500 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>
          <div className="md:col-span-2 flex items-end gap-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              Limpar Filtros
            </button>
            <div className="text-sm text-slate-400 ml-auto self-center">
              {total} unidade{total !== 1 ? "s" : ""} encontrada{total !== 1 ? "s" : ""}
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
                <th className="text-left py-3 px-4 font-medium text-slate-300">Bloco</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Número</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Área (m²)</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Quartos</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Vagas</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Moradores</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Veículos</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Observações</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300 w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      Carregando...
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    Nenhuma unidade encontrada.
                  </td>
                </tr>
              ) : (
                list.map((unit) => (
                  <tr
                    key={unit.id}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg font-medium">
                        <Building2 className="w-3.5 h-3.5" />
                        {unit.block}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg font-medium">
                        <Home className="w-3.5 h-3.5" />
                        {unit.number}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {unit.areaM2 ? `${unit.areaM2} m²` : "-"}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {unit.bedrooms ?? "-"}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {unit.parkingSpots ?? "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <Users className="w-4 h-4 text-blue-400" />
                        {unit._count?.residents ?? 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <Car className="w-4 h-4 text-amber-400" />
                        {unit._count?.vehicles ?? 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-[200px] truncate">
                      {unit.notes || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openModal(unit)}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(unit)}
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
              Página {page} de {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
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
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
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
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                {editingUnit ? "Editar Unidade" : "Nova Unidade"}
              </h2>
              <button
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Bloco <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={formData.block}
                    onChange={(e) => handleInputChange("block", e.target.value)}
                    placeholder="Ex.: A"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition uppercase"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Número/Apto <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={formData.number}
                    onChange={(e) => handleInputChange("number", e.target.value)}
                    placeholder="Ex.: 101"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Área (m²)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.areaM2}
                    onChange={(e) => handleInputChange("areaM2", e.target.value)}
                    placeholder="Ex.: 65.50"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Quartos
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                    placeholder="Ex.: 2"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Vagas de Garagem
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.parkingSpots}
                    onChange={(e) => handleInputChange("parkingSpots", e.target.value)}
                    placeholder="Ex.: 1"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">
                    Observações
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Informações adicionais..."
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
                  />
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
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      {editingUnit ? "Salvar Alterações" : "Cadastrar Unidade"}
                    </>
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
                Excluir Unidade?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Deseja realmente excluir a unidade{" "}
                <span className="text-white font-medium">
                  Bloco {deleteConfirm.block} - {deleteConfirm.number}
                </span>
                ? Esta ação não pode ser desfeita.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
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
