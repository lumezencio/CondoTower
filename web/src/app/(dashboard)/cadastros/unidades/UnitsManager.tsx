"use client";

import React, { useEffect, useMemo, useState } from "react";

type Unit = {
  id: string;
  block: string;
  number: string;
  notes: string | null;
  createdAt?: string;
};

export default function UnitsManager() {
  const [list, setList] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [block, setBlock] = useState("");
  const [apartment, setApartment] = useState("");

  // form
  const [fBlock, setFBlock] = useState("");
  const [fApartment, setFApartment] = useState("");
  const [fNotes, setFNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (block.trim()) p.set("block", block.trim());
    if (apartment.trim()) p.set("number", apartment.trim());
    p.set("page", String(page));
    return p.toString();
  }, [block, apartment, page]);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/units?${qs}`, { cache: "no-store" });
      const j = await r.json();
      if (j?.ok) setList(j.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [qs]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      block: fBlock.trim(),
      apartment: fApartment.trim(), // backend aceita number/apartment
      notes: fNotes.trim() || null,
    };
    if (!payload.block || !payload.apartment) {
      alert("Informe Bloco e Apartamento.");
      return;
    }
    setSaving(true);
    try {
      const r = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (j?.ok) {
        setFBlock("");
        setFApartment("");
        setFNotes("");
        setPage(1);
        await load();
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="col-span-1">
          <label className="text-xs text-slate-400">Bloco</label>
          <input
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            placeholder="Ex.: A"
            className="w-full rounded-lg border border-slate-700 bg-slate-900/70 text-slate-100 placeholder-slate-500 focus:border-indigo-500  px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="col-span-1">
          <label className="text-xs text-slate-400">Apartamento</label>
          <input
            value={apartment}
            onChange={(e) => setApartment(e.target.value)}
            placeholder="Ex.: 101"
            className="w-full rounded-lg border border-slate-700 bg-slate-900/70 text-slate-100 placeholder-slate-500 focus:border-indigo-500  px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="col-span-2 flex items-end justify-start gap-2">
          <button
            onClick={() => { setPage(1); load(); }}
            className="rounded-xl px-4 py-2 bg-indigo-600 hover:bg-indigo-500 transition"
          >
            Filtrar
          </button>
          <button
            onClick={() => { setBlock(""); setApartment(""); setPage(1); }}
            className="rounded-xl px-4 py-2 bg-slate-800 hover:bg-slate-700 transition"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-100 font-semibold">Unidades</h3>
          {loading && <span className="text-xs text-slate-400">Carregando…</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-300">
              <tr className="border-b border-slate-800">
                <th className="text-left py-2 pr-4">Bloco</th>
                <th className="text-left py-2 pr-4">Apto</th>
                <th className="text-left py-2 pr-4">Observações</th>
                <th className="text-left py-2 pr-4">Criado em</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              {list.map(u => (
                <tr key={u.id} className="border-b border-slate-800/60 hover:bg-slate-900/70 text-slate-100 placeholder-slate-500 focus:border-indigo-500 ">
                  <td className="py-2 pr-4">{u.block}</td>
                  <td className="py-2 pr-4">{u.number}</td>
                  <td className="py-2 pr-4">{u.notes ?? "-"}</td>
                  <td className="py-2 pr-4">{u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
              {list.length === 0 && !loading && (
                <tr><td colSpan={4} className="py-6 text-center text-slate-400">Nenhuma unidade encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={onCreate} className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur p-4">
        <h3 className="text-slate-100 font-semibold mb-3">Cadastrar nova unidade</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <label className="text-xs text-slate-400">Bloco *</label>
            <input
              value={fBlock}
              onChange={(e) => setFBlock(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/70 text-slate-100 placeholder-slate-500 focus:border-indigo-500  px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Apartamento *</label>
            <input
              value={fApartment}
              onChange={(e) => setFApartment(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/70 text-slate-100 placeholder-slate-500 focus:border-indigo-500  px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="md:col-span-4">
            <label className="text-xs text-slate-400">Observações</label>
            <input
              value={fNotes}
              onChange={(e) => setFNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/70 text-slate-100 placeholder-slate-500 focus:border-indigo-500  px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="md:col-span-6 flex gap-2">
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

