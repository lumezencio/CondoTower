"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Plus, Search, Edit2, Trash2, X, Users, Building2, Home,
  Phone, Mail, CreditCard, Calendar, ChevronLeft, ChevronRight,
  Crown, KeyRound, User, Briefcase, MapPin, FileText, Car, Dog, Heart,
  Palette, Tag, Syringe
} from "lucide-react";

/* ============================================
   TIPOS
============================================ */

type Unit = {
  id: string;
  block: string;
  number: string;
  owners?: Owner[];
};

type Owner = {
  id: string;
  unitId: string;
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
  rentValue: string | null;
  notes: string | null;
  unit?: Unit;
};

type OwnerType = "PROPRIETARIO" | "INQUILINO";

type OwnerFormData = {
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

const initialOwnerFormData: OwnerFormData = {
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

type ModalTab = "proprietario" | "inquilino" | "veiculos" | "pets" | "familiares";

// Tipos para Veiculo
type Vehicle = {
  id: string;
  unitId: string;
  plate: string;
  brand: string | null;
  model: string | null;
  color: string | null;
  year: number | null;
  tag: string | null;
  notes: string | null;
};

type VehicleFormData = {
  plate: string;
  brand: string;
  model: string;
  color: string;
  year: string;
  tag: string;
  notes: string;
};

const initialVehicleForm: VehicleFormData = {
  plate: "",
  brand: "",
  model: "",
  color: "",
  year: "",
  tag: "",
  notes: "",
};

// Tipos para Pet
type Pet = {
  id: string;
  unitId: string;
  name: string;
  species: string;
  breed: string | null;
  color: string | null;
  size: string | null;
  birthDate: string | null;
  vaccinated: boolean;
  notes: string | null;
};

type PetFormData = {
  name: string;
  species: string;
  breed: string;
  color: string;
  size: string;
  birthDate: string;
  vaccinated: boolean;
  notes: string;
};

const initialPetForm: PetFormData = {
  name: "",
  species: "",
  breed: "",
  color: "",
  size: "",
  birthDate: "",
  vaccinated: false,
  notes: "",
};

// Tipos para Familiar (usa Resident)
type Familiar = {
  id: string;
  unitId: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  role: string;
  birthDate: string | null;
};

type FamiliarFormData = {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
};

const initialFamiliarForm: FamiliarFormData = {
  name: "",
  email: "",
  phone: "",
  cpf: "",
  birthDate: "",
};

const SPECIES_OPTIONS = [
  { value: "CACHORRO", label: "Cachorro" },
  { value: "GATO", label: "Gato" },
  { value: "PASSARO", label: "Passaro" },
  { value: "PEIXE", label: "Peixe" },
  { value: "HAMSTER", label: "Hamster" },
  { value: "COELHO", label: "Coelho" },
  { value: "TARTARUGA", label: "Tartaruga" },
  { value: "OUTRO", label: "Outro" },
];

const SIZE_OPTIONS = [
  { value: "PEQUENO", label: "Pequeno" },
  { value: "MEDIO", label: "Medio" },
  { value: "GRANDE", label: "Grande" },
];

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

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

/* ============================================
   FORMATADORES
============================================ */

function formatCPF(value: string) {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
}

function formatPhone(value: string) {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

function formatCEP(value: string) {
  const numbers = value.replace(/\D/g, "").slice(0, 8);
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
}

function formatCurrency(value: string) {
  const numbers = value.replace(/\D/g, "");
  if (!numbers) return "";
  const num = parseInt(numbers, 10) / 100;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseCurrency(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (!numbers) return "";
  return (parseInt(numbers, 10) / 100).toFixed(2);
}

/* ============================================
   COMPONENTE PRINCIPAL
============================================ */

export default function ResidentsManager() {
  // Lista de owners
  const [list, setList] = useState<Owner[]>([]);
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
  const [filterType, setFilterType] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>("proprietario");
  const [selectedUnitId, setSelectedUnitId] = useState("");

  // Formularios separados para cada tipo
  const [proprietarioForm, setProprietarioForm] = useState<OwnerFormData>({ ...initialOwnerFormData, type: "PROPRIETARIO" });
  const [inquilinoForm, setInquilinoForm] = useState<OwnerFormData>({ ...initialOwnerFormData, type: "INQUILINO" });
  const [editingProprietario, setEditingProprietario] = useState<Owner | null>(null);
  const [editingInquilino, setEditingInquilino] = useState<Owner | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Owner | null>(null);
  const [deleting, setDeleting] = useState(false);

  // CEP loading
  const [loadingCEP, setLoadingCEP] = useState<OwnerType | null>(null);

  // Estados para Veiculos
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleForm, setVehicleForm] = useState<VehicleFormData>(initialVehicleForm);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [deleteVehicleConfirm, setDeleteVehicleConfirm] = useState<Vehicle | null>(null);

  // Estados para Pets
  const [pets, setPets] = useState<Pet[]>([]);
  const [petForm, setPetForm] = useState<PetFormData>(initialPetForm);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [loadingPets, setLoadingPets] = useState(false);
  const [deletePetConfirm, setDeletePetConfirm] = useState<Pet | null>(null);

  // Estados para Familiares
  const [familiares, setFamiliares] = useState<Familiar[]>([]);
  const [familiarForm, setFamiliarForm] = useState<FamiliarFormData>(initialFamiliarForm);
  const [editingFamiliar, setEditingFamiliar] = useState<Familiar | null>(null);
  const [loadingFamiliares, setLoadingFamiliares] = useState(false);
  const [deleteFamiliarConfirm, setDeleteFamiliarConfirm] = useState<Familiar | null>(null);

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
    if (filterType) params.set("type", filterType);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [filterName, filterBlock, filterType, page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/owners?${queryString}`, { cache: "no-store" });
      const data = await response.json();
      if (data?.ok) {
        setList(data.data ?? []);
        setTotal(data.total ?? 0);
      }
    } catch (err) {
      console.error("Erro ao carregar proprietarios/inquilinos:", err);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    load();
  }, [load]);

  // Agrupar unidades por bloco para o select
  const unitsByBlock = useMemo(() => {
    const grouped: Record<string, Unit[]> = {};
    units.forEach((unit) => {
      if (!grouped[unit.block]) grouped[unit.block] = [];
      grouped[unit.block].push(unit);
    });
    Object.keys(grouped).forEach((block) => {
      grouped[block].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
    });
    return grouped;
  }, [units]);

  const blocksOrdered = Object.keys(unitsByBlock).sort();

  // Buscar dados existentes da unidade selecionada
  const loadUnitOwners = useCallback(async (unitId: string) => {
    if (!unitId) return;

    try {
      const response = await fetch(`/api/owners?unitId=${unitId}&pageSize=10`);
      const data = await response.json();

      if (data?.ok) {
        const owners: Owner[] = data.data ?? [];

        const proprietario = owners.find(o => o.type === "PROPRIETARIO");
        const inquilino = owners.find(o => o.type === "INQUILINO");

        if (proprietario) {
          setEditingProprietario(proprietario);
          setProprietarioForm({
            unitId: proprietario.unitId,
            type: "PROPRIETARIO",
            name: proprietario.name,
            cpf: formatCPF(proprietario.cpf),
            rg: proprietario.rg ?? "",
            phone: proprietario.phone ? formatPhone(proprietario.phone) : "",
            phone2: proprietario.phone2 ? formatPhone(proprietario.phone2) : "",
            email: proprietario.email ?? "",
            birthDate: proprietario.birthDate ? proprietario.birthDate.split("T")[0] : "",
            profession: proprietario.profession ?? "",
            billingStreet: proprietario.billingStreet ?? "",
            billingNumber: proprietario.billingNumber ?? "",
            billingComplement: proprietario.billingComplement ?? "",
            billingNeighborhood: proprietario.billingNeighborhood ?? "",
            billingCity: proprietario.billingCity ?? "",
            billingState: proprietario.billingState ?? "",
            billingZip: proprietario.billingZip ? formatCEP(proprietario.billingZip) : "",
            contractStart: "",
            contractEnd: "",
            rentValue: "",
            notes: proprietario.notes ?? "",
          });
        } else {
          setEditingProprietario(null);
          setProprietarioForm({ ...initialOwnerFormData, type: "PROPRIETARIO", unitId });
        }

        if (inquilino) {
          setEditingInquilino(inquilino);
          setInquilinoForm({
            unitId: inquilino.unitId,
            type: "INQUILINO",
            name: inquilino.name,
            cpf: formatCPF(inquilino.cpf),
            rg: inquilino.rg ?? "",
            phone: inquilino.phone ? formatPhone(inquilino.phone) : "",
            phone2: inquilino.phone2 ? formatPhone(inquilino.phone2) : "",
            email: inquilino.email ?? "",
            birthDate: inquilino.birthDate ? inquilino.birthDate.split("T")[0] : "",
            profession: inquilino.profession ?? "",
            billingStreet: inquilino.billingStreet ?? "",
            billingNumber: inquilino.billingNumber ?? "",
            billingComplement: inquilino.billingComplement ?? "",
            billingNeighborhood: inquilino.billingNeighborhood ?? "",
            billingCity: inquilino.billingCity ?? "",
            billingState: inquilino.billingState ?? "",
            billingZip: inquilino.billingZip ? formatCEP(inquilino.billingZip) : "",
            contractStart: inquilino.contractStart ? inquilino.contractStart.split("T")[0] : "",
            contractEnd: inquilino.contractEnd ? inquilino.contractEnd.split("T")[0] : "",
            rentValue: inquilino.rentValue ? formatCurrency(String(parseFloat(inquilino.rentValue) * 100)) : "",
            notes: inquilino.notes ?? "",
          });
        } else {
          setEditingInquilino(null);
          setInquilinoForm({ ...initialOwnerFormData, type: "INQUILINO", unitId });
        }
      }
    } catch (err) {
      console.error("Erro ao carregar dados da unidade:", err);
    }
  }, []);

  const openModal = (owner?: Owner) => {
    setError("");
    setSuccess("");

    if (owner) {
      // Editando um owner existente
      setSelectedUnitId(owner.unitId);
      setActiveTab(owner.type === "PROPRIETARIO" ? "proprietario" : "inquilino");
      loadUnitOwners(owner.unitId);
    } else {
      // Novo cadastro
      setSelectedUnitId("");
      setActiveTab("proprietario");
      setEditingProprietario(null);
      setEditingInquilino(null);
      setProprietarioForm({ ...initialOwnerFormData, type: "PROPRIETARIO" });
      setInquilinoForm({ ...initialOwnerFormData, type: "INQUILINO" });
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUnitId("");
    setActiveTab("proprietario");
    setEditingProprietario(null);
    setEditingInquilino(null);
    setProprietarioForm({ ...initialOwnerFormData, type: "PROPRIETARIO" });
    setInquilinoForm({ ...initialOwnerFormData, type: "INQUILINO" });
    setError("");
    setSuccess("");
  };

  const handleUnitChange = (unitId: string) => {
    setSelectedUnitId(unitId);
    setProprietarioForm(prev => ({ ...prev, unitId }));
    setInquilinoForm(prev => ({ ...prev, unitId }));

    if (unitId) {
      loadUnitOwners(unitId);
      loadVehicles(unitId);
      loadPets(unitId);
      loadFamiliares(unitId);
    } else {
      setEditingProprietario(null);
      setEditingInquilino(null);
      setProprietarioForm({ ...initialOwnerFormData, type: "PROPRIETARIO" });
      setInquilinoForm({ ...initialOwnerFormData, type: "INQUILINO" });
      // Limpar veiculos, pets e familiares
      setVehicles([]);
      setPets([]);
      setFamiliares([]);
      setVehicleForm(initialVehicleForm);
      setPetForm(initialPetForm);
      setFamiliarForm(initialFamiliarForm);
      setEditingVehicle(null);
      setEditingPet(null);
      setEditingFamiliar(null);
    }
  };

  const handleProprietarioChange = (field: keyof OwnerFormData, value: string) => {
    setProprietarioForm(prev => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleInquilinoChange = (field: keyof OwnerFormData, value: string) => {
    setInquilinoForm(prev => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  // Buscar endereco pelo CEP via ViaCEP
  const fetchCEP = async (cep: string, type: OwnerType) => {
    const cleanCEP = cep.replace(/\D/g, "");
    if (cleanCEP.length !== 8) return;

    setLoadingCEP(type);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();

      if (!data.erro) {
        const setForm = type === "PROPRIETARIO" ? setProprietarioForm : setInquilinoForm;
        setForm(prev => ({
          ...prev,
          billingStreet: (data.logradouro ?? "").toUpperCase(),
          billingNeighborhood: (data.bairro ?? "").toUpperCase(),
          billingCity: (data.localidade ?? "").toUpperCase(),
          billingState: data.uf ?? "",
        }));
      }
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
    } finally {
      setLoadingCEP(null);
    }
  };

  const handleSaveOwner = async (type: OwnerType) => {
    const form = type === "PROPRIETARIO" ? proprietarioForm : inquilinoForm;
    const editing = type === "PROPRIETARIO" ? editingProprietario : editingInquilino;

    if (!selectedUnitId) {
      setError("Selecione a unidade.");
      return;
    }

    if (!form.name.trim()) {
      setError("Nome e obrigatorio.");
      return;
    }

    const cpfClean = form.cpf.replace(/\D/g, "");
    if (cpfClean.length !== 11) {
      setError("CPF deve ter 11 digitos.");
      return;
    }

    const payload = {
      unitId: selectedUnitId,
      type,
      name: form.name.trim().toUpperCase(),
      cpf: cpfClean,
      rg: form.rg.trim().toUpperCase() || null,
      phone: form.phone.replace(/\D/g, "") || null,
      phone2: form.phone2.replace(/\D/g, "") || null,
      email: form.email.trim().toUpperCase() || null,
      birthDate: form.birthDate || null,
      profession: form.profession.trim().toUpperCase() || null,
      billingStreet: form.billingStreet.trim().toUpperCase() || null,
      billingNumber: form.billingNumber.trim().toUpperCase() || null,
      billingComplement: form.billingComplement.trim().toUpperCase() || null,
      billingNeighborhood: form.billingNeighborhood.trim().toUpperCase() || null,
      billingCity: form.billingCity.trim().toUpperCase() || null,
      billingState: form.billingState || null,
      billingZip: form.billingZip.replace(/\D/g, "") || null,
      contractStart: type === "INQUILINO" ? (form.contractStart || null) : null,
      contractEnd: type === "INQUILINO" ? (form.contractEnd || null) : null,
      rentValue: type === "INQUILINO" && form.rentValue ? parseCurrency(form.rentValue) : null,
      notes: form.notes.trim().toUpperCase() || null,
    };

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const url = editing ? `/api/owners/${editing.id}` : "/api/owners";
      const method = editing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data?.ok) {
        setSuccess(`${TYPE_LABELS[type]} ${editing ? "atualizado" : "cadastrado"} com sucesso!`);
        await load();
        await loadUnitOwners(selectedUnitId);
      } else {
        setError(data?.message ?? "Erro ao salvar.");
      }
    } catch (err) {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOwner = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/owners/${deleteConfirm.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data?.ok) {
        setDeleteConfirm(null);
        setSuccess(`${TYPE_LABELS[deleteConfirm.type]} excluido com sucesso!`);
        await load();

        // Se estiver no modal, recarregar dados
        if (isModalOpen && selectedUnitId) {
          await loadUnitOwners(selectedUnitId);
        }
      } else {
        alert(data?.message ?? "Erro ao excluir.");
      }
    } catch (err) {
      alert("Erro de conexao. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterName("");
    setFilterBlock("");
    setFilterType("");
    setPage(1);
  };

  // Renderizar formulario de owner (Proprietario ou Inquilino)
  const renderOwnerForm = (type: OwnerType) => {
    const form = type === "PROPRIETARIO" ? proprietarioForm : inquilinoForm;
    const handleChange = type === "PROPRIETARIO" ? handleProprietarioChange : handleInquilinoChange;
    const editing = type === "PROPRIETARIO" ? editingProprietario : editingInquilino;
    const Icon = TYPE_ICONS[type];

    return (
      <div className="space-y-6">
        {/* Cabecalho do tipo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${TYPE_COLORS[type]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{TYPE_LABELS[type]}</h3>
              <p className="text-xs text-slate-400">
                {editing ? "Editando cadastro existente" : "Novo cadastro"}
              </p>
            </div>
          </div>
          {editing && (
            <button
              type="button"
              onClick={() => setDeleteConfirm(editing)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
              title="Excluir"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Secao: Dados Pessoais */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-300 border-b border-white/10 pb-2">
            <User className="w-4 h-4 text-emerald-400" />
            Dados Pessoais
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="md:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">
                Nome Completo <span className="text-red-400">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value.toUpperCase())}
                placeholder="NOME COMPLETO"
                className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition uppercase"
              />
            </div>

            {/* CPF */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                CPF <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={form.cpf}
                  onChange={(e) => handleChange("cpf", formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>

            {/* RG */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">RG</label>
              <input
                value={form.rg}
                onChange={(e) => handleChange("rg", e.target.value.toUpperCase())}
                placeholder="00.000.000-0"
                className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition uppercase"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Telefone Principal</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={form.phone}
                  onChange={(e) => handleChange("phone", formatPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>

            {/* Telefone 2 */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Telefone Secundario</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={form.phone2}
                  onChange={(e) => handleChange("phone2", formatPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value.toUpperCase())}
                  placeholder="EMAIL@EXEMPLO.COM"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition uppercase"
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
                  value={form.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  title="Data de nascimento"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 pl-10 pr-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>

            {/* Profissao */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Profissao</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={form.profession}
                  onChange={(e) => handleChange("profession", e.target.value.toUpperCase())}
                  placeholder="PROFISSAO"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Secao: Endereco de Cobranca */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-300 border-b border-white/10 pb-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            Endereco de Cobranca
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* CEP */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">CEP</label>
              <div className="relative">
                <input
                  value={form.billingZip}
                  onChange={(e) => {
                    const value = formatCEP(e.target.value);
                    handleChange("billingZip", value);
                    if (value.replace(/\D/g, "").length === 8) {
                      fetchCEP(value, type);
                    }
                  }}
                  placeholder="00000-000"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
                {loadingCEP === type && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Rua */}
            <div className="md:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">Rua/Logradouro</label>
              <input
                value={form.billingStreet}
                onChange={(e) => handleChange("billingStreet", e.target.value.toUpperCase())}
                placeholder="RUA/AVENIDA"
                className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition uppercase"
              />
            </div>

            {/* Numero */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Numero</label>
              <input
                value={form.billingNumber}
                onChange={(e) => handleChange("billingNumber", e.target.value.toUpperCase())}
                placeholder="N"
                className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition uppercase"
              />
            </div>

            {/* Complemento */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Complemento</label>
              <input
                value={form.billingComplement}
                onChange={(e) => handleChange("billingComplement", e.target.value.toUpperCase())}
                placeholder="APTO/SALA"
                className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition uppercase"
              />
            </div>

            {/* Bairro */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Bairro</label>
              <input
                value={form.billingNeighborhood}
                onChange={(e) => handleChange("billingNeighborhood", e.target.value.toUpperCase())}
                placeholder="BAIRRO"
                className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition uppercase"
              />
            </div>

            {/* Cidade */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Cidade</label>
              <input
                value={form.billingCity}
                onChange={(e) => handleChange("billingCity", e.target.value.toUpperCase())}
                placeholder="CIDADE"
                className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition uppercase"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Estado</label>
              <select
                value={form.billingState}
                onChange={(e) => handleChange("billingState", e.target.value)}
                title="Estado"
                className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
              >
                <option value="">UF</option>
                {ESTADOS_BR.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Secao: Contrato (apenas para Inquilino) */}
        {type === "INQUILINO" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300 border-b border-white/10 pb-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Dados do Contrato
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Inicio do Contrato */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Inicio do Contrato</label>
                <input
                  type="date"
                  value={form.contractStart}
                  onChange={(e) => handleChange("contractStart", e.target.value)}
                  title="Data de inicio do contrato"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>

              {/* Fim do Contrato */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Fim do Contrato</label>
                <input
                  type="date"
                  value={form.contractEnd}
                  onChange={(e) => handleChange("contractEnd", e.target.value)}
                  title="Data de fim do contrato"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>

              {/* Valor do Aluguel */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Valor do Aluguel</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                  <input
                    value={form.rentValue}
                    onChange={(e) => handleChange("rentValue", formatCurrency(e.target.value))}
                    placeholder="0,00"
                    className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Observacoes */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Observacoes</label>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value.toUpperCase())}
            placeholder="OBSERVACOES ADICIONAIS..."
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition resize-none uppercase"
          />
        </div>

        {/* Botao Salvar */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => handleSaveOwner(type)}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                {editing ? "Atualizar" : "Cadastrar"} {TYPE_LABELS[type]}
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // Carregar veiculos da unidade
  const loadVehicles = useCallback(async (unitId: string) => {
    if (!unitId) return;
    setLoadingVehicles(true);
    try {
      const response = await fetch(`/api/vehicles?unitId=${unitId}&pageSize=100`);
      const data = await response.json();
      if (data?.ok) {
        setVehicles(data.data ?? []);
      }
    } catch (err) {
      console.error("Erro ao carregar veiculos:", err);
    } finally {
      setLoadingVehicles(false);
    }
  }, []);

  // Carregar pets da unidade
  const loadPets = useCallback(async (unitId: string) => {
    if (!unitId) return;
    setLoadingPets(true);
    try {
      const response = await fetch(`/api/pets?unitId=${unitId}&pageSize=100`);
      const data = await response.json();
      if (data?.ok) {
        setPets(data.data ?? []);
      }
    } catch (err) {
      console.error("Erro ao carregar pets:", err);
    } finally {
      setLoadingPets(false);
    }
  }, []);

  // Carregar familiares da unidade
  const loadFamiliares = useCallback(async (unitId: string) => {
    if (!unitId) return;
    setLoadingFamiliares(true);
    try {
      const response = await fetch(`/api/residents?unitId=${unitId}&role=FAMILIAR&pageSize=100`);
      const data = await response.json();
      if (data?.ok) {
        setFamiliares(data.data ?? []);
      }
    } catch (err) {
      console.error("Erro ao carregar familiares:", err);
    } finally {
      setLoadingFamiliares(false);
    }
  }, []);

  // Salvar veiculo
  const handleSaveVehicle = async () => {
    if (!selectedUnitId) {
      setError("Selecione a unidade.");
      return;
    }
    if (!vehicleForm.plate.trim()) {
      setError("Placa e obrigatoria.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const url = editingVehicle ? `/api/vehicles/${editingVehicle.id}` : "/api/vehicles";
      const method = editingVehicle ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: selectedUnitId,
          plate: vehicleForm.plate.trim().toUpperCase(),
          brand: vehicleForm.brand.trim().toUpperCase() || null,
          model: vehicleForm.model.trim().toUpperCase() || null,
          color: vehicleForm.color.trim().toUpperCase() || null,
          year: vehicleForm.year ? Number(vehicleForm.year) : null,
          tag: vehicleForm.tag.trim().toUpperCase() || null,
          notes: vehicleForm.notes.trim().toUpperCase() || null,
        }),
      });

      const data = await response.json();

      if (data?.ok) {
        setSuccess(`Veiculo ${editingVehicle ? "atualizado" : "cadastrado"} com sucesso!`);
        setVehicleForm(initialVehicleForm);
        setEditingVehicle(null);
        await loadVehicles(selectedUnitId);
      } else {
        setError(data?.message ?? "Erro ao salvar veiculo.");
      }
    } catch (err) {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  // Excluir veiculo
  const handleDeleteVehicle = async () => {
    if (!deleteVehicleConfirm) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/vehicles/${deleteVehicleConfirm.id}`, { method: "DELETE" });
      const data = await response.json();

      if (data?.ok) {
        setDeleteVehicleConfirm(null);
        setSuccess("Veiculo excluido com sucesso!");
        await loadVehicles(selectedUnitId);
      } else {
        alert(data?.message ?? "Erro ao excluir veiculo.");
      }
    } catch (err) {
      alert("Erro de conexao.");
    } finally {
      setDeleting(false);
    }
  };

  // Salvar pet
  const handleSavePet = async () => {
    if (!selectedUnitId) {
      setError("Selecione a unidade.");
      return;
    }
    if (!petForm.name.trim()) {
      setError("Nome do pet e obrigatorio.");
      return;
    }
    if (!petForm.species) {
      setError("Especie e obrigatoria.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const url = editingPet ? `/api/pets/${editingPet.id}` : "/api/pets";
      const method = editingPet ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: selectedUnitId,
          name: petForm.name.trim().toUpperCase(),
          species: petForm.species,
          breed: petForm.breed.trim().toUpperCase() || null,
          color: petForm.color.trim().toUpperCase() || null,
          size: petForm.size || null,
          birthDate: petForm.birthDate || null,
          vaccinated: petForm.vaccinated,
          notes: petForm.notes.trim().toUpperCase() || null,
        }),
      });

      const data = await response.json();

      if (data?.ok) {
        setSuccess(`Pet ${editingPet ? "atualizado" : "cadastrado"} com sucesso!`);
        setPetForm(initialPetForm);
        setEditingPet(null);
        await loadPets(selectedUnitId);
      } else {
        setError(data?.message ?? "Erro ao salvar pet.");
      }
    } catch (err) {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  // Excluir pet
  const handleDeletePet = async () => {
    if (!deletePetConfirm) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/pets/${deletePetConfirm.id}`, { method: "DELETE" });
      const data = await response.json();

      if (data?.ok) {
        setDeletePetConfirm(null);
        setSuccess("Pet excluido com sucesso!");
        await loadPets(selectedUnitId);
      } else {
        alert(data?.message ?? "Erro ao excluir pet.");
      }
    } catch (err) {
      alert("Erro de conexao.");
    } finally {
      setDeleting(false);
    }
  };

  // Salvar familiar
  const handleSaveFamiliar = async () => {
    if (!selectedUnitId) {
      setError("Selecione a unidade.");
      return;
    }
    if (!familiarForm.name.trim()) {
      setError("Nome e obrigatorio.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const url = editingFamiliar ? `/api/residents/${editingFamiliar.id}` : "/api/residents";
      const method = editingFamiliar ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: selectedUnitId,
          name: familiarForm.name.trim().toUpperCase(),
          email: familiarForm.email.trim().toUpperCase() || null,
          phone: familiarForm.phone.replace(/\D/g, "") || null,
          cpf: familiarForm.cpf.replace(/\D/g, "") || null,
          role: "FAMILIAR",
          birthDate: familiarForm.birthDate || null,
        }),
      });

      const data = await response.json();

      if (data?.ok) {
        setSuccess(`Familiar ${editingFamiliar ? "atualizado" : "cadastrado"} com sucesso!`);
        setFamiliarForm(initialFamiliarForm);
        setEditingFamiliar(null);
        await loadFamiliares(selectedUnitId);
      } else {
        setError(data?.message ?? "Erro ao salvar familiar.");
      }
    } catch (err) {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  // Excluir familiar
  const handleDeleteFamiliar = async () => {
    if (!deleteFamiliarConfirm) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/residents/${deleteFamiliarConfirm.id}`, { method: "DELETE" });
      const data = await response.json();

      if (data?.ok) {
        setDeleteFamiliarConfirm(null);
        setSuccess("Familiar excluido com sucesso!");
        await loadFamiliares(selectedUnitId);
      } else {
        alert(data?.message ?? "Erro ao excluir familiar.");
      }
    } catch (err) {
      alert("Erro de conexao.");
    } finally {
      setDeleting(false);
    }
  };

  // Formatar placa
  const formatPlate = (value: string) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  };

  // Renderizar aba de Veiculos
  const renderVehiclesTab = () => {
    return (
      <div className="space-y-6">
        {/* Cabecalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-emerald-400 bg-emerald-500/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Veiculos</h3>
              <p className="text-xs text-slate-400">
                {vehicles.length} veiculo{vehicles.length !== 1 ? "s" : ""} cadastrado{vehicles.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de veiculos existentes */}
        {vehicles.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-medium">Veiculos cadastrados:</div>
            <div className="grid gap-2">
              {vehicles.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-white font-medium">{v.plate}</div>
                      <div className="text-xs text-slate-400">
                        {[v.brand, v.model, v.color, v.year].filter(Boolean).join(" · ") || "Sem detalhes"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingVehicle(v);
                        setVehicleForm({
                          plate: v.plate,
                          brand: v.brand ?? "",
                          model: v.model ?? "",
                          color: v.color ?? "",
                          year: v.year?.toString() ?? "",
                          tag: v.tag ?? "",
                          notes: v.notes ?? "",
                        });
                      }}
                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteVehicleConfirm(v)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="space-y-4 border-t border-white/10 pt-4">
          <div className="text-sm font-medium text-slate-300">
            {editingVehicle ? "Editar Veiculo" : "Adicionar Novo Veiculo"}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Placa */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                Placa <span className="text-red-400">*</span>
              </label>
              <input
                value={vehicleForm.plate}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, plate: formatPlate(e.target.value) }))}
                placeholder="ABC1D23"
                maxLength={7}
                className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition uppercase"
              />
            </div>

            {/* Marca */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Marca</label>
              <input
                value={vehicleForm.brand}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, brand: e.target.value.toUpperCase() }))}
                placeholder="VOLKSWAGEN"
                className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition uppercase"
              />
            </div>

            {/* Modelo */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Modelo</label>
              <input
                value={vehicleForm.model}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, model: e.target.value.toUpperCase() }))}
                placeholder="GOL"
                className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition uppercase"
              />
            </div>

            {/* Cor */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Cor</label>
              <div className="relative">
                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={vehicleForm.color}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, color: e.target.value.toUpperCase() }))}
                  placeholder="PRATA"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition uppercase"
                />
              </div>
            </div>

            {/* Ano */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Ano</label>
              <input
                type="number"
                value={vehicleForm.year}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, year: e.target.value }))}
                placeholder="2024"
                min="1900"
                max="2100"
                className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
              />
            </div>

            {/* Tag */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Tag/Adesivo</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={vehicleForm.tag}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, tag: e.target.value.toUpperCase() }))}
                  placeholder="001234"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition uppercase"
                />
              </div>
            </div>
          </div>

          {/* Observacoes */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Observacoes</label>
            <textarea
              value={vehicleForm.notes}
              onChange={(e) => setVehicleForm(prev => ({ ...prev, notes: e.target.value.toUpperCase() }))}
              placeholder="OBSERVACOES..."
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition resize-none uppercase"
            />
          </div>

          {/* Botoes */}
          <div className="flex items-center gap-2 justify-end">
            {editingVehicle && (
              <button
                type="button"
                onClick={() => {
                  setEditingVehicle(null);
                  setVehicleForm(initialVehicleForm);
                }}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveVehicle}
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>{editingVehicle ? "Atualizar" : "Adicionar"} Veiculo</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar aba de Pets
  const renderPetsTab = () => {
    return (
      <div className="space-y-6">
        {/* Cabecalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-purple-400 bg-purple-500/20">
              <Dog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Pets</h3>
              <p className="text-xs text-slate-400">
                {pets.length} pet{pets.length !== 1 ? "s" : ""} cadastrado{pets.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de pets existentes */}
        {pets.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-medium">Pets cadastrados:</div>
            <div className="grid gap-2">
              {pets.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <Dog className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-white font-medium">{p.name}</div>
                      <div className="text-xs text-slate-400">
                        {[
                          SPECIES_OPTIONS.find(s => s.value === p.species)?.label ?? p.species,
                          p.breed,
                          p.color,
                          SIZE_OPTIONS.find(s => s.value === p.size)?.label,
                        ].filter(Boolean).join(" · ")}
                        {p.vaccinated && (
                          <span className="ml-2 text-emerald-400">
                            <Syringe className="w-3 h-3 inline" /> Vacinado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPet(p);
                        setPetForm({
                          name: p.name,
                          species: p.species,
                          breed: p.breed ?? "",
                          color: p.color ?? "",
                          size: p.size ?? "",
                          birthDate: p.birthDate ? p.birthDate.split("T")[0] : "",
                          vaccinated: p.vaccinated,
                          notes: p.notes ?? "",
                        });
                      }}
                      className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletePetConfirm(p)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="space-y-4 border-t border-white/10 pt-4">
          <div className="text-sm font-medium text-slate-300">
            {editingPet ? "Editar Pet" : "Adicionar Novo Pet"}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Nome */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                Nome <span className="text-red-400">*</span>
              </label>
              <input
                value={petForm.name}
                onChange={(e) => setPetForm(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                placeholder="REX"
                className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition uppercase"
              />
            </div>

            {/* Especie */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                Especie <span className="text-red-400">*</span>
              </label>
              <select
                value={petForm.species}
                onChange={(e) => setPetForm(prev => ({ ...prev, species: e.target.value }))}
                title="Especie do pet"
                className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
              >
                <option value="">Selecione...</option>
                {SPECIES_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Raca */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Raca</label>
              <input
                value={petForm.breed}
                onChange={(e) => setPetForm(prev => ({ ...prev, breed: e.target.value.toUpperCase() }))}
                placeholder="LABRADOR"
                className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition uppercase"
              />
            </div>

            {/* Cor */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Cor</label>
              <div className="relative">
                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={petForm.color}
                  onChange={(e) => setPetForm(prev => ({ ...prev, color: e.target.value.toUpperCase() }))}
                  placeholder="CARAMELO"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition uppercase"
                />
              </div>
            </div>

            {/* Porte */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Porte</label>
              <select
                value={petForm.size}
                onChange={(e) => setPetForm(prev => ({ ...prev, size: e.target.value }))}
                title="Porte do pet"
                className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
              >
                <option value="">Selecione...</option>
                {SIZE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Data Nascimento */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Data de Nascimento</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={petForm.birthDate}
                  onChange={(e) => setPetForm(prev => ({ ...prev, birthDate: e.target.value }))}
                  title="Data de nascimento do pet"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 pl-10 pr-3 py-2.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
                />
              </div>
            </div>
          </div>

          {/* Vacinado */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={petForm.vaccinated}
                onChange={(e) => setPetForm(prev => ({ ...prev, vaccinated: e.target.checked }))}
                className="w-5 h-5 rounded border-white/20 bg-slate-800 text-purple-500 focus:ring-purple-500/20"
              />
              <span className="text-sm text-slate-300 flex items-center gap-2">
                <Syringe className="w-4 h-4 text-emerald-400" />
                Pet vacinado
              </span>
            </label>
          </div>

          {/* Observacoes */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Observacoes</label>
            <textarea
              value={petForm.notes}
              onChange={(e) => setPetForm(prev => ({ ...prev, notes: e.target.value.toUpperCase() }))}
              placeholder="OBSERVACOES..."
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition resize-none uppercase"
            />
          </div>

          {/* Botoes */}
          <div className="flex items-center gap-2 justify-end">
            {editingPet && (
              <button
                type="button"
                onClick={() => {
                  setEditingPet(null);
                  setPetForm(initialPetForm);
                }}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={handleSavePet}
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>{editingPet ? "Atualizar" : "Adicionar"} Pet</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar aba de Familiares
  const renderFamiliaresTab = () => {
    return (
      <div className="space-y-6">
        {/* Cabecalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-pink-400 bg-pink-500/20">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Familiares e Moradores</h3>
              <p className="text-xs text-slate-400">
                {familiares.length} pessoa{familiares.length !== 1 ? "s" : ""} cadastrada{familiares.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-lg text-pink-300 text-sm">
          <p>Cadastre aqui todos os familiares e moradores da unidade (filhos, conjuges, pais, etc). Voce pode adicionar quantas pessoas precisar.</p>
        </div>

        {/* Lista de familiares existentes */}
        {familiares.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-medium">Pessoas cadastradas nesta unidade:</div>
            <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-1">
              {familiares.map((f, index) => (
                <div key={f.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-medium text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-medium">{f.name}</div>
                      <div className="text-xs text-slate-400">
                        {[
                          f.phone ? formatPhone(f.phone) : null,
                          f.email,
                          f.cpf ? `CPF: ${formatCPF(f.cpf)}` : null,
                        ].filter(Boolean).join(" · ") || "Sem contato"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFamiliar(f);
                        setFamiliarForm({
                          name: f.name,
                          email: f.email ?? "",
                          phone: f.phone ? formatPhone(f.phone) : "",
                          cpf: f.cpf ? formatCPF(f.cpf) : "",
                          birthDate: f.birthDate ? f.birthDate.split("T")[0] : "",
                        });
                        setError("");
                        setSuccess("");
                      }}
                      className="p-1.5 text-slate-400 hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteFamiliarConfirm(f)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="space-y-4 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Plus className="w-4 h-4 text-pink-400" />
              {editingFamiliar ? "Editar Pessoa" : "Adicionar Nova Pessoa"}
            </div>
            {editingFamiliar && (
              <button
                type="button"
                onClick={() => {
                  setEditingFamiliar(null);
                  setFamiliarForm(initialFamiliarForm);
                  setError("");
                  setSuccess("");
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Cancelar edicao
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="md:col-span-2">
              <label className="text-xs text-slate-400 mb-1 block">
                Nome Completo <span className="text-red-400">*</span>
              </label>
              <input
                value={familiarForm.name}
                onChange={(e) => setFamiliarForm(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                placeholder="NOME COMPLETO"
                className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition uppercase"
              />
            </div>

            {/* CPF */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">CPF</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={familiarForm.cpf}
                  onChange={(e) => setFamiliarForm(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
                  placeholder="000.000.000-00"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition"
                />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={familiarForm.phone}
                  onChange={(e) => setFamiliarForm(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                  placeholder="(00) 00000-0000"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={familiarForm.email}
                  onChange={(e) => setFamiliarForm(prev => ({ ...prev, email: e.target.value.toUpperCase() }))}
                  placeholder="EMAIL@EXEMPLO.COM"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition uppercase"
                />
              </div>
            </div>

            {/* Data Nascimento */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Data de Nascimento</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={familiarForm.birthDate}
                  onChange={(e) => setFamiliarForm(prev => ({ ...prev, birthDate: e.target.value }))}
                  title="Data de nascimento"
                  className="w-full rounded-lg border border-white/10 bg-slate-800 text-slate-100 pl-10 pr-3 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition"
                />
              </div>
            </div>
          </div>

          {/* Botoes */}
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={handleSaveFamiliar}
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {editingFamiliar ? "Atualizar Pessoa" : "Adicionar Pessoa"}
                </>
              )}
            </button>
          </div>

          {/* Dica */}
          {!editingFamiliar && familiares.length > 0 && (
            <p className="text-xs text-slate-500 text-center">
              Continue adicionando mais pessoas preenchendo o formulario acima e clicando em "Adicionar Pessoa"
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-emerald-400" />
            Agenda de Contatos
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Proprietarios, inquilinos e moradores
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/25"
        >
          <Plus className="w-5 h-5" />
          Novo Cadastro
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
              title="Filtrar por bloco"
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
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              title="Filtrar por tipo"
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
            >
              <option value="">Todos</option>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
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
              {total} registro{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
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
                <th className="text-center py-3 px-4 font-medium text-slate-300 w-24">Acoes</th>
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
                    Nenhum registro encontrado.
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
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                            owner.type === "PROPRIETARIO"
                              ? "bg-gradient-to-br from-amber-500 to-orange-600"
                              : "bg-gradient-to-br from-blue-500 to-indigo-600"
                          } text-white font-semibold text-sm`}>
                            {owner.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-slate-100 font-medium">{owner.name}</div>
                            {owner.profession && (
                              <span className="text-xs text-slate-500">{owner.profession}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {owner.unit && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs">
                              <Building2 className="w-3 h-3" />
                              {owner.unit.block}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-500/20 text-slate-300 rounded text-xs">
                              <Home className="w-3 h-3" />
                              {owner.unit.number}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${TYPE_COLORS[owner.type]}`}>
                          <TypeIcon className="w-3.5 h-3.5" />
                          {TYPE_LABELS[owner.type]}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {owner.phone && (
                            <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                              <Phone className="w-3 h-3 text-slate-500" />
                              {formatPhone(owner.phone)}
                            </div>
                          )}
                          {owner.email && (
                            <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                              <Mail className="w-3 h-3 text-slate-500" />
                              {owner.email}
                            </div>
                          )}
                          {!owner.phone && !owner.email && (
                            <span className="text-slate-500 text-xs">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-xs">
                        {owner.cpf ? formatCPF(owner.cpf) : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => openModal(owner)}
                            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(owner)}
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
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                title="Pagina anterior"
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
                title="Proxima pagina"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edicao com Abas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                Cadastro de Moradores
              </h2>
              <button
                type="button"
                onClick={closeModal}
                title="Fechar modal"
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selecao de Unidade */}
            <div className="px-4 pt-4 pb-2 border-b border-white/10 bg-slate-900/50">
              <label className="text-xs text-slate-400 mb-1 block">
                Selecione a Unidade <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedUnitId}
                onChange={(e) => handleUnitChange(e.target.value)}
                title="Selecione a unidade"
                className="w-full max-w-md rounded-lg border border-white/10 bg-slate-800 text-slate-100 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
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

            {/* Abas */}
            <div className="flex border-b border-white/10 bg-slate-900/50 px-4">
              {/* Aba Proprietario */}
              <button
                type="button"
                onClick={() => setActiveTab("proprietario")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === "proprietario"
                    ? "border-amber-500 text-amber-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                <Crown className="w-4 h-4" />
                Proprietario
              </button>

              {/* Aba Inquilino */}
              <button
                type="button"
                onClick={() => setActiveTab("inquilino")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === "inquilino"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                <KeyRound className="w-4 h-4" />
                Inquilino
              </button>

              {/* Aba Veiculos */}
              <button
                type="button"
                onClick={() => setActiveTab("veiculos")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === "veiculos"
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                <Car className="w-4 h-4" />
                Veiculos
              </button>

              {/* Aba Pets */}
              <button
                type="button"
                onClick={() => setActiveTab("pets")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === "pets"
                    ? "border-purple-500 text-purple-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                <Dog className="w-4 h-4" />
                Pets
              </button>

              {/* Aba Familiares */}
              <button
                type="button"
                onClick={() => setActiveTab("familiares")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === "familiares"
                    ? "border-pink-500 text-pink-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                <Heart className="w-4 h-4" />
                Familiares
              </button>
            </div>

            {/* Conteudo das Abas */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Mensagens de Erro/Sucesso */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm">
                  {success}
                </div>
              )}

              {/* Aviso se nao selecionou unidade */}
              {!selectedUnitId && (
                <div className="mb-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-300 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Selecione uma unidade acima para vincular o cadastro.
                </div>
              )}

              {/* Formularios sempre visiveis */}
              {activeTab === "proprietario" && renderOwnerForm("PROPRIETARIO")}
              {activeTab === "inquilino" && renderOwnerForm("INQUILINO")}
              {activeTab === "veiculos" && renderVehiclesTab()}
              {activeTab === "pets" && renderPetsTab()}
              {activeTab === "familiares" && renderFamiliaresTab()}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmacao de Exclusao */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
                Excluir {TYPE_LABELS[deleteConfirm.type]}?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Deseja realmente excluir{" "}
                <span className="text-white font-medium">{deleteConfirm.name}</span>
                ? Esta acao nao pode ser desfeita.
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
                  onClick={handleDeleteOwner}
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

      {/* Modal de Confirmacao de Exclusao - Veiculo */}
      {deleteVehicleConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteVehicleConfirm(null)}
          />
          <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Excluir Veiculo?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Deseja realmente excluir o veiculo{" "}
                <span className="text-white font-medium">{deleteVehicleConfirm.plate}</span>
                ? Esta acao nao pode ser desfeita.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteVehicleConfirm(null)}
                  className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteVehicle}
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

      {/* Modal de Confirmacao de Exclusao - Pet */}
      {deletePetConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeletePetConfirm(null)}
          />
          <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <Dog className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Excluir Pet?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Deseja realmente excluir{" "}
                <span className="text-white font-medium">{deletePetConfirm.name}</span>
                ? Esta acao nao pode ser desfeita.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletePetConfirm(null)}
                  className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeletePet}
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

      {/* Modal de Confirmacao de Exclusao - Familiar */}
      {deleteFamiliarConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteFamiliarConfirm(null)}
          />
          <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Excluir Familiar?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Deseja realmente excluir{" "}
                <span className="text-white font-medium">{deleteFamiliarConfirm.name}</span>
                ? Esta acao nao pode ser desfeita.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteFamiliarConfirm(null)}
                  className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteFamiliar}
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
