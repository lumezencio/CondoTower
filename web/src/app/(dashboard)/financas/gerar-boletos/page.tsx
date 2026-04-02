"use client";

import React, { useState, useEffect } from "react";
import {
  FileText, Plus, Loader2, Calendar, DollarSign, Building2,
  CheckCircle2, Printer, Download, RefreshCw, AlertTriangle,
  Banknote, Hash, Percent,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

type Unit = {
  id: string;
  block: string;
  number: string;
  areaM2: number;
};

type BoletoData = {
  unitId: string;
  unidade: string;
  valor: number;
  vencimento: string;
  multa: number;
  juros: number;
  status: "gerado" | "pendente" | "pago";
};

export default function GerarBoletosPage() {
  const { push } = useToast();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [mesReferencia, setMesReferencia] = useState(new Date().toISOString().slice(0, 7));
  const [diaVencimento, setDiaVencimento] = useState(10);
  const [valorTaxa, setValorTaxa] = useState("350.00");
  const [valorMulta, setValorMulta] = useState("2.00");
  const [valorJuros, setValorJuros] = useState("0.33");

  const [boletosGerados, setBoletosGerados] = useState<BoletoData[]>([]);
  const [selectedAll, setSelectedAll] = useState(true);
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());

  useEffect(() => { loadUnits(); }, []);

  const loadUnits = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/units?pageSize=500");
      const data = await res.json();
      if (data.ok) {
        setUnits(data.data || []);
        setSelectedUnits(new Set((data.data || []).map((u: Unit) => u.id)));
      }
    } catch {
      push({ title: "Erro", message: "Falha ao carregar unidades", kind: "error" });
    } finally {
      setLoading(false);
    }
  };

  const gerarBoletos = async () => {
    if (!valorTaxa || parseFloat(valorTaxa) <= 0) {
      push({ title: "Valor inválido", message: "Informe um valor de taxa maior que zero", kind: "warning" });
      return;
    }

    setGenerating(true);
    try {
      const filteredUnits = units.filter(u => selectedUnits.has(u.id));
      const boletos: BoletoData[] = filteredUnits.map((unit) => ({
        unitId: unit.id,
        unidade: `${unit.block} - ${unit.number}`,
        valor: parseFloat(valorTaxa),
        vencimento: `${mesReferencia}-${String(diaVencimento).padStart(2, "0")}`,
        multa: parseFloat(valorMulta) || 0,
        juros: parseFloat(valorJuros) || 0,
        status: "gerado" as const,
      }));

      setBoletosGerados(boletos);
      push({
        title: "Boletos gerados",
        message: `${boletos.length} boletos foram gerados com sucesso`,
        kind: "success",
      });
    } catch {
      push({ title: "Erro", message: "Falha ao gerar boletos", kind: "error" });
    } finally {
      setGenerating(false);
    }
  };

  const salvarBoletos = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/boletos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boletos: boletosGerados,
          mesReferencia,
          valorTaxa: parseFloat(valorTaxa),
          multa: parseFloat(valorMulta),
          juros: parseFloat(valorJuros),
        }),
      });

      const data = await response.json();
      if (data.ok) {
        push({ title: "Boletos salvos", message: `${boletosGerados.length} boletos foram salvos no sistema`, kind: "success" });
        setBoletosGerados([]);
      } else {
        push({ title: "Erro", message: data.message, kind: "error" });
      }
    } catch {
      push({ title: "Erro", message: "Falha ao salvar boletos", kind: "error" });
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatDate = (dateString: string) => {
    const [ano, mes, dia] = dateString.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const toggleAll = () => {
    if (selectedAll) {
      setSelectedUnits(new Set());
    } else {
      setSelectedUnits(new Set(units.map(u => u.id)));
    }
    setSelectedAll(!selectedAll);
  };

  const toggleUnit = (id: string) => {
    const next = new Set(selectedUnits);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedUnits(next);
    setSelectedAll(next.size === units.length);
  };

  const totalGeral = boletosGerados.reduce((sum, b) => sum + b.valor, 0);
  const inputCls = "bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 border border-teal-500/30">
              <Banknote className="w-6 h-6 text-teal-400" />
            </div>
            Gerar Boletos
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Gere boletos de condomínio para as unidades cadastradas</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadUnits} className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 border border-slate-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Unidades", value: units.length, color: "border-slate-600", icon: Building2, iconCls: "text-slate-400" },
          { label: "Selecionadas", value: selectedUnits.size, color: "border-cyan-500", icon: CheckCircle2, iconCls: "text-cyan-400" },
          { label: "Boletos Gerados", value: boletosGerados.length, color: "border-teal-500", icon: FileText, iconCls: "text-teal-400" },
          { label: "Total Gerado", value: formatCurrency(totalGeral), color: "border-emerald-500", icon: DollarSign, iconCls: "text-emerald-400", isText: true },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`bg-slate-900 border border-slate-800 border-t-2 ${card.color} rounded-2xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.iconCls}`} />
              </div>
              <div className="text-2xl font-bold text-slate-100">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Configuration card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400 text-xs uppercase tracking-wider font-semibold">Configurações dos Boletos</span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">Mês de Referência *</label>
              <input
                type="month"
                value={mesReferencia}
                onChange={(e) => setMesReferencia(e.target.value)}
                className={`${inputCls} w-full`}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">Dia do Vencimento *</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={diaVencimento}
                  onChange={(e) => setDiaVencimento(Number(e.target.value))}
                  className={`${inputCls} pl-10 w-full`}
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">Valor da Taxa *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  step="0.01"
                  value={valorTaxa}
                  onChange={(e) => setValorTaxa(e.target.value)}
                  className={`${inputCls} pl-10 w-full`}
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">Multa por Atraso (%)</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  step="0.01"
                  value={valorMulta}
                  onChange={(e) => setValorMulta(e.target.value)}
                  className={`${inputCls} pl-10 w-full`}
                  placeholder="2.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">Juros por Dia (%)</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  step="0.01"
                  value={valorJuros}
                  onChange={(e) => setValorJuros(e.target.value)}
                  className={`${inputCls} pl-10 w-full`}
                  placeholder="0.33"
                />
              </div>
            </div>
          </div>

          {/* Unit selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-cyan-400 text-xs uppercase tracking-wider font-semibold">Unidades</p>
              <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAll}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20"
                />
                Selecionar todas
              </label>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
                {units.map((unit) => (
                  <label
                    key={unit.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
                      selectedUnits.has(unit.id)
                        ? "bg-slate-800 border-cyan-500/50 text-slate-200"
                        : "bg-slate-800/30 border-slate-700/50 text-slate-500 hover:border-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUnits.has(unit.id)}
                      onChange={() => toggleUnit(unit.id)}
                      className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20"
                    />
                    <span className="truncate">{unit.block}-{unit.number}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Generate button */}
          <button
            onClick={gerarBoletos}
            disabled={generating || loading || selectedUnits.size === 0}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Gerar Boletos ({selectedUnits.size} unidades)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated boletos */}
      {boletosGerados.length > 0 && (
        <>
          {/* Summary banner */}
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-300 text-sm font-medium">Boletos gerados com sucesso</p>
                  <p className="text-slate-100 text-lg font-bold">
                    {boletosGerados.length} boletos &bull; Total: {formatCurrency(totalGeral)}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={salvarBoletos}
                  disabled={generating}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-green-400 transition-all disabled:opacity-50"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Salvar Boletos
                </button>
              </div>
            </div>
          </div>

          {/* Boleto table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Unidade</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Vencimento</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Multa</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Juros/Dia</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {boletosGerados.map((boleto) => (
                    <tr key={boleto.unitId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-500" />
                          <span className="font-medium text-slate-200">{boleto.unidade}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {formatDate(boleto.vencimento)}
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-semibold text-teal-300">{formatCurrency(boleto.valor)}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm text-slate-400">{boleto.multa}%</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm text-slate-400">{boleto.juros}%</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          Gerado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {boletosGerados.length === 0 && !loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center py-16">
          <FileText className="w-12 h-12 text-slate-700 mb-3" />
          <h3 className="text-slate-300 font-semibold mb-1">Nenhum boleto gerado</h3>
          <p className="text-slate-500 text-sm mb-4">Configure os parâmetros e clique em "Gerar Boletos"</p>
          <p className="text-slate-600 text-xs">{units.length} unidades cadastradas</p>
        </div>
      )}
    </div>
  );
}
