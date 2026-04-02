'use client';

import React, { useState, useEffect } from 'react';
import {
  Gift, Plus, Ticket, Star, Trophy, Clock, CheckCircle2,
  XCircle, Loader2, RefreshCw, Users, Calendar, Sparkles, ChevronDown, ChevronUp,
} from 'lucide-react';

interface LotteryTicket {
  id: string;
  number: number;
  holderName: string;
}

interface Lottery {
  id: string;
  title: string;
  type: string;
  description?: string;
  scheduledFor: string;
  status: string;
  winner?: string;
  tickets?: LotteryTicket[];
}

const TYPE_LABELS: Record<string, string> = {
  UNIDADE:   'Por Unidade',
  MORADOR:   'Por Morador',
  FUNCIONARIO: 'Funcionários',
  LIVRE:     'Participação Livre',
};

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  AGENDADO:  { label: 'Agendado',  cls: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',           dot: 'bg-blue-400' },
  EM_CURSO:  { label: 'Em Curso',  cls: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',         dot: 'bg-amber-400' },
  CONCLUIDO: { label: 'Concluído', cls: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',   dot: 'bg-emerald-400' },
  CANCELADO: { label: 'Cancelado', cls: 'bg-red-500/20 text-red-300 border border-red-500/30',               dot: 'bg-red-400' },
};

const TYPE_GRADIENT: Record<string, string> = {
  UNIDADE:   'from-rose-500 to-pink-500',
  MORADOR:   'from-violet-500 to-purple-500',
  FUNCIONARIO: 'from-amber-500 to-yellow-500',
  LIVRE:     'from-cyan-500 to-blue-500',
};

function formatDate(d: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(d));
}

export default function SorteioPage() {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({ tenant: 'parkclub', page: '1', pageSize: '50' });
    if (filterStatus) params.set('status', filterStatus);
    const res = await fetch(`/api/lotteries?${params}`);
    const data = await res.json();
    if (data.ok) setLotteries(data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterStatus]);

  const counts = {
    total:     lotteries.length,
    agendado:  lotteries.filter(l => l.status === 'AGENDADO').length,
    concluido: lotteries.filter(l => l.status === 'CONCLUIDO').length,
    totalPart: lotteries.reduce((s, l) => s + (l.tickets?.length ?? 0), 0),
  };

  const selectCls = 'bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30">
              <Gift className="w-6 h-6 text-rose-400" />
            </div>
            Sorteios
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Gerencie sorteios e premiações do condomínio</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 border border-slate-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:from-rose-400 hover:to-pink-400 transition-all">
            <Plus className="w-4 h-4" />
            Novo Sorteio
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total',         value: counts.total,    color: 'border-slate-600',   iconCls: 'text-slate-400',   icon: Gift },
          { label: 'Agendados',     value: counts.agendado, color: 'border-blue-500',    iconCls: 'text-blue-400',    icon: Calendar },
          { label: 'Concluídos',    value: counts.concluido,color: 'border-emerald-500', iconCls: 'text-emerald-400', icon: Trophy },
          { label: 'Participantes', value: counts.totalPart,color: 'border-rose-500',    iconCls: 'text-rose-400',    icon: Users },
        ].map(card => {
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

      {/* Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-slate-400 text-sm">Filtrar por status:</span>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectCls}>
          <option value="">Todos</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Lottery Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
          </div>
        ) : lotteries.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center py-16 text-slate-500">
            <Gift className="w-12 h-12 mb-3 opacity-30" />
            <p>Nenhum sorteio encontrado</p>
          </div>
        ) : (
          lotteries.map(lottery => {
            const sCfg = STATUS_CONFIG[lottery.status] ?? STATUS_CONFIG.AGENDADO;
            const gradient = TYPE_GRADIENT[lottery.type] ?? 'from-slate-600 to-slate-700';
            const isExpanded = expanded === lottery.id;
            const ticketCount = lottery.tickets?.length ?? 0;

            return (
              <div key={lottery.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon with gradient */}
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} flex-shrink-0 shadow-lg`}>
                      <Gift className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/50">
                          {TYPE_LABELS[lottery.type] ?? lottery.type.replace(/_/g, ' ')}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${sCfg.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot} ${lottery.status === 'EM_CURSO' ? 'animate-pulse' : ''}`} />
                          {sCfg.label}
                        </span>
                      </div>

                      <h3 className="text-slate-100 font-semibold text-base mb-1">{lottery.title}</h3>
                      {lottery.description && <p className="text-slate-400 text-sm mb-2">{lottery.description}</p>}

                      {/* Winner banner */}
                      {lottery.winner && (
                        <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                          <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span className="text-amber-300 text-sm font-medium">Vencedor: {lottery.winner}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {formatDate(lottery.scheduledFor)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Ticket className="w-3 h-3" />
                          {ticketCount} participante{ticketCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpanded(isExpanded ? null : lottery.id)}
                      className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Participants */}
                  {isExpanded && lottery.tickets && lottery.tickets.length > 0 && (
                    <div className="mt-4 ml-14">
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-cyan-400 text-xs uppercase tracking-wider font-semibold">
                            Participantes ({lottery.tickets.length})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {lottery.tickets.slice(0, 20).map(ticket => (
                            <div
                              key={ticket.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-700/60 rounded-lg border border-slate-600/50 text-xs"
                            >
                              <Ticket className="w-3 h-3 text-slate-400" />
                              <span className="text-slate-300 font-mono">#{ticket.number}</span>
                              <span className="text-slate-400">{ticket.holderName}</span>
                            </div>
                          ))}
                          {lottery.tickets.length > 20 && (
                            <div className="inline-flex items-center px-2.5 py-1 bg-slate-700/30 rounded-lg border border-slate-700 text-xs text-slate-500">
                              +{lottery.tickets.length - 20} mais
                            </div>
                          )}
                        </div>
                      </div>

                      {lottery.status === 'AGENDADO' && (
                        <button className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:from-rose-400 hover:to-pink-400 transition-all shadow-lg">
                          <Sparkles className="w-4 h-4" />
                          Realizar Sorteio
                        </button>
                      )}
                    </div>
                  )}

                  {isExpanded && (!lottery.tickets || lottery.tickets.length === 0) && (
                    <div className="mt-4 ml-14 text-sm text-slate-500 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Nenhum participante inscrito ainda
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
