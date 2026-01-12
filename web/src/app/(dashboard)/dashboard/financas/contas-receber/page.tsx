"use client";

import { TrendingUp, Plus, Search, Filter } from "lucide-react";

export default function ContasReceberPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-green-400" />
            Contas a Receber
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie as receitas e recebimentos do condomínio
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-green-500/25"
        >
          <Plus className="w-5 h-5" />
          Nova Receita
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
                placeholder="Descrição ou unidade..."
                className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Status</label>
            <select className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition">
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="RECEBIDO">Recebido</option>
              <option value="VENCIDO">Vencido</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tipo</label>
            <select className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition">
              <option value="">Todos</option>
              <option value="TAXA_CONDOMINIO">Taxa de Condomínio</option>
              <option value="TAXA_EXTRA">Taxa Extra</option>
              <option value="MULTA">Multa</option>
              <option value="RESERVA">Reserva de Área</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Tabela placeholder */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left py-3 px-4 font-medium text-slate-300">Descrição</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Unidade</th>
                <th className="text-left py-3 px-4 font-medium text-slate-300">Vencimento</th>
                <th className="text-right py-3 px-4 font-medium text-slate-300">Valor</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300">Status</th>
                <th className="text-center py-3 px-4 font-medium text-slate-300 w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  Nenhuma conta a receber cadastrada.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
