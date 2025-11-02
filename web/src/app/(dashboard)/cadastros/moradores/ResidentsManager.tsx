"use client";

import React, { useEffect, useMemo, useState } from "react";

type Unit = {
  id: string;
  block: string;
  number: string;
  notes?: string | null;
};

type Resident = {
  id: string;
  unitId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  cpf?: string | null;       // backend salva como cpf
  document?: string | null;  // frontend envia "document" e o backend mapeia
  type?: string | null;      // "MORADOR" etc.
  isPrimary?: boolean;
  isOwner?: boolean;
  createdAt?: string;
};

export default function ResidentsManager() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);

  // filtros simples (opcional): bloco, apto, nome
  const [fBlock, setFBlock] = useState("");
  const [fApto, setFApto] = useState("");
  const [fName, setFName] = useState("");

  // form de criação
  const [uSelected, setUSelected] = useState("");
  const [rName, setRName] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPhone, setRPhone] = useState("");
  const [rDoc, setRDoc] = useState("");
  const [rType, setRType] = useState("MORADOR");
  const [rPrimary, setRPrimary] = useState(true);
  const [rOwner, setROwner] = useState(false);
  const [saving, setSaving] = useState(false);

  const unitLabel = (u: Unit) => `${u.block}-${u.number}`;

  async function loadUnits() {
    const r = await fetch(`/api/units?page=1&pageSize=1000`, { cache: "no-store" });
    const j = await r.json();
    if (j?.ok) setUnits(j.data ?? []);
  }

  async function loadResidents() {
    setLoading(true);
    try {
      const r = await fetch(`/api/residents?page=1&pageSize=1000`, { cache: "no-store" });
      const j = await r.json();
      if (j?.ok) setResidents(j.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUnits();
    loadResidents();
  }, []);

  const unitsFiltered = useMemo(() => {
    return units.filter(u => {
      if (fBlock.trim() && u.block.toLowerCase() !== fBlock.trim().toLowerCase()) return false;
      if (fApto.trim()  && u.number.toLowerCase() !== fApto.trim().toLowerCase()) return false;
      return true;
    });
  }, [units, fBlock, fApto]);

  const residentsFiltered = useMemo(() => {
    const nameFilter = fName.trim().toLowerCase();
    const allowedUnitIds = new Set(unitsFiltered.map(u => u.id));
    return residents.filter(r => {
      if (nameFilter && !r.name.toLowerCase().includes(nameFilter)) return false;
      if (allowedUnitIds.size && !allowedUnitIds.has(r.unitId)) return false;
      return true;
    });
  }, [residents, unitsFiltered, fName]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!uSelected || !rName.trim()) {
      alert("Selecione uma unidade e informe o nome.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        unitId: uSelected,
        name: rName.trim(),
        email: rEmail.trim() || null,
        phone: rPhone.trim() || null,
        document: rDoc.trim() || null, // backend converte document->cpf
        type: rType,
        isPrimary: rPrimary,
        isOwner: rOwner,
      };
      const r = await fetch("/api/residents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (j?.ok) {
        // limpa e recarrega
        setUSelected("");
        setRName("");
        setREmail("");
        setRPhone("");
        setRDoc("");
        setRType("MORADOR");
        setRPrimary(true);
        setROwner(false);
        await loadResidents();
      } else {
        alert(j?.message ?? "Falha ao salvar");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div>
          <label className="text-xs text-slate-400">Bloco</label>
          <input
            value={fBlock}
            onChange={(e) => setFBlock(e.target.value)}
            placeholder="Ex.: A"
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Apartamento</label>
          <input
            value={fApto}
            onChange={(e) => setFApto(e.target.value)}
            placeholder="Ex.: 101"
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-slate-400">Nome</label>
          <input
            value={fName}
            onChange={(e) => setFName(e.target.value)}
            placeholder="Buscar por nome"
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="md:col-span-2 flex items-end gap-2">
          <button
            onClick={() => { /* filtros reativos já aplicam */ }}
            className="rounded-xl px-4 py-2 bg-indigo-600 hover:bg-indigo-500 transition"
          >
            Filtrar
          </button>
          <button
            onClick={() => { setFBlock(""); setFApto(""); setFName(""); }}
            className="rounded-xl px-4 py-2 bg-slate-800 hover:bg-slate-700 transition"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-100 font-semibold">Moradores</h3>
          {loading && <span className="text-xs text-slate-400">Carregando…</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-300">
              <tr className="border-b border-slate-800">
                <th className="text-left py-2 pr-4">Nome</th>
                <th className="text-left py-2 pr-4">Unidade</th>
                <th className="text-left py-2 pr-4">Contato</th>
                <th className="text-left py-2 pr-4">Documento</th>
                <th className="text-left py-2 pr-4">Tipo</th>
                <th className="text-left py-2 pr-4">Flags</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              {residentsFiltered.map(r => {
                const u = units.find(x => x.id === r.unitId);
                const doc = (r as any).document || r.cpf || "-";
                return (
                  <tr key={r.id} className="border-b border-slate-800/60 hover:bg-slate-900/60">
                    <td className="py-2 pr-4">{r.name}</td>
                    <td className="py-2 pr-4">{u ? unitLabel(u) : "-"}</td>
                    <td className="py-2 pr-4">
                      <div className="text-slate-200">{r.email || "-"}</div>
                      <div className="text-slate-400 text-xs">{r.phone || "-"}</div>
                    </td>
                    <td className="py-2 pr-4">{doc}</td>
                    <td className="py-2 pr-4">{r.type || "-"}</td>
                    <td className="py-2 pr-4">
                      <span className="text-xs text-slate-400">
                        {r.isPrimary ? "Titular" : "—"} {r.isOwner ? "· Proprietário" : ""}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {residentsFiltered.length === 0 && !loading && (
                <tr><td colSpan={6} className="py-6 text-center text-slate-400">Nenhum morador encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={onCreate} className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur p-4">
        <h3 className="text-slate-100 font-semibold mb-3">Cadastrar morador</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-400">Unidade *</label>
            <select
              value={uSelected}
              onChange={(e) => setUSelected(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecione…</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>{unitLabel(u)}</option>
              ))}
            </select>
          </div>
          <div className="">
            <label className="text-xs text-slate-400">Nome *</label>
            <input
              value={rName}
              onChange={(e) => setRName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">E-mail</label>
            <input
              value={rEmail}
              onChange={(e) => setREmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Telefone</label>
            <input
              value={rPhone}
              onChange={(e) => setRPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Documento (CPF)</label>
            <input
              value={rDoc}
              onChange={(e) => setRDoc(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Tipo</label>
            <select
              value={rType}
              onChange={(e) => setRType(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="MORADOR">MORADOR</option>
              <option value="INQUILINO">INQUILINO</option>
              <option value="PROPRIETARIO">PROPRIETARIO</option>
              <option value="VISITANTE">VISITANTE</option>
            </select>
          </div>
          <div className="md:col-span-6 flex items-center gap-6 pt-2">
            <label className="inline-flex items-center gap-2 text-slate-300">
              <input type="checkbox" checked={rPrimary} onChange={e=>setRPrimary(e.target.checked)} />
              Titular da unidade
            </label>
            <label className="inline-flex items-center gap-2 text-slate-300">
              <input type="checkbox" checked={rOwner} onChange={e=>setROwner(e.target.checked)} />
              Proprietário
            </label>
          </div>
          <div className="md:col-span-6">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl px-4 py-2 bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50"
            >
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
