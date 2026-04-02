'use client';

import React, { useState, useEffect } from 'react';
import {
  ListChecks, Plus, BarChart3, CheckCircle2, Clock, XCircle,
  Loader2, RefreshCw, Users, Calendar, TrendingUp, ChevronDown, ChevronUp,
} from 'lucide-react';

interface PollOption {
  id?: string;
  text: string;
  votes?: number;
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  options: PollOption[] | string[];
  startsAt: string;
  endsAt: string;
  status: string;
  totalVotes: number;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  RASCUNHO:  { label: 'Rascunho',  cls: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',          dot: 'bg-slate-400' },
  ATIVA:     { label: 'Ativa',     cls: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',     dot: 'bg-emerald-400' },
  ENCERRADA: { label: 'Encerrada', cls: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',          dot: 'bg-slate-500' },
  CANCELADA: { label: 'Cancelada', cls: 'bg-red-500/20 text-red-300 border border-red-500/30',                dot: 'bg-red-400' },
};

const OPTION_COLORS = [
  'bg-cyan-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500',
  'bg-rose-500', 'bg-blue-500', 'bg-orange-500', 'bg-teal-500',
];

function formatDate(d: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(d));
}

function getOptionText(opt: PollOption | string): string {
  if (typeof opt === 'string') return opt;
  return opt.text ?? String(opt);
}

function getOptionVotes(opt: PollOption | string): number {
  if (typeof opt === 'object' && opt.votes !== undefined) return opt.votes;
  return 0;
}

export default function EnquetesPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [voted, setVoted] = useState<Record<string, number>>({});

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({ tenant: 'parkclub', page: '1', pageSize: '50' });
    if (filterStatus) params.set('status', filterStatus);
    const res = await fetch(`/api/polls?${params}`);
    const data = await res.json();
    if (data.ok) setPolls(data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterStatus]);

  const counts = {
    total:     polls.length,
    ativas:    polls.filter(p => p.status === 'ATIVA').length,
    encerradas:polls.filter(p => p.status === 'ENCERRADA').length,
    totalVotos:polls.reduce((s, p) => s + (p.totalVotes ?? 0), 0),
  };

  const handleVote = async (pollId: string, optionIdx: number) => {
    setVoted(v => ({ ...v, [pollId]: optionIdx }));
    await fetch(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionIndex: optionIdx, tenant: 'parkclub' }),
    }).catch(() => {});
  };

  const selectCls = 'bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <ListChecks className="w-6 h-6 text-purple-400" />
            </div>
            Enquetes
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Participe das votações e decisões do condomínio</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 border border-slate-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl font-medium shadow-lg hover:from-purple-400 hover:to-violet-400 transition-all">
            <Plus className="w-4 h-4" />
            Nova Enquete
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total',         value: counts.total,      color: 'border-slate-600',   iconCls: 'text-slate-400',   icon: ListChecks },
          { label: 'Ativas',        value: counts.ativas,     color: 'border-emerald-500', iconCls: 'text-emerald-400', icon: CheckCircle2 },
          { label: 'Encerradas',    value: counts.encerradas, color: 'border-slate-500',   iconCls: 'text-slate-400',   icon: XCircle },
          { label: 'Total de Votos',value: counts.totalVotos, color: 'border-purple-500',  iconCls: 'text-purple-400',  icon: Users },
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
          <option value="">Todas</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Poll Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : polls.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center py-16 text-slate-500">
            <ListChecks className="w-12 h-12 mb-3 opacity-30" />
            <p>Nenhuma enquete encontrada</p>
          </div>
        ) : (
          polls.map(poll => {
            const sCfg = STATUS_CONFIG[poll.status] ?? STATUS_CONFIG.RASCUNHO;
            const isExpanded = expanded === poll.id;
            const hasVoted = voted[poll.id] !== undefined;
            const isActive = poll.status === 'ATIVA';
            const totalVotesDisplay = poll.totalVotes || 1;

            return (
              <div key={poll.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 flex-shrink-0">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${sCfg.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot} ${poll.status === 'ATIVA' ? 'animate-pulse' : ''}`} />
                          {sCfg.label}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Users className="w-3 h-3" />
                          {poll.totalVotes} votos
                        </span>
                      </div>

                      <h3 className="text-slate-100 font-semibold text-base mb-1">{poll.title}</h3>
                      {poll.description && <p className="text-slate-400 text-sm mb-2">{poll.description}</p>}

                      <div className="flex gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Início: {formatDate(poll.startsAt)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Fim: {formatDate(poll.endsAt)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpanded(isExpanded ? null : poll.id)}
                      className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Options */}
                  {isExpanded && (
                    <div className="mt-4 ml-14 space-y-3">
                      <p className="text-cyan-400 text-xs uppercase tracking-wider font-semibold">Opções</p>
                      {Array.isArray(poll.options) && poll.options.map((opt, idx) => {
                        const text = getOptionText(opt);
                        const optVotes = getOptionVotes(opt);
                        const pct = poll.totalVotes > 0 ? Math.round((optVotes / totalVotesDisplay) * 100) : 0;
                        const isSelected = voted[poll.id] === idx;
                        const barColor = OPTION_COLORS[idx % OPTION_COLORS.length];

                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex items-center gap-3">
                              {isActive && !hasVoted ? (
                                <button
                                  onClick={() => handleVote(poll.id, idx)}
                                  className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-purple-500/50 hover:bg-slate-800 transition-all text-left group"
                                >
                                  <div className={`w-4 h-4 rounded-full border-2 ${isSelected ? 'border-purple-500 bg-purple-500' : 'border-slate-500 group-hover:border-purple-400'} flex-shrink-0 transition-colors`} />
                                  <span className="text-slate-200 text-sm flex-1">{text}</span>
                                </button>
                              ) : (
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className={`text-sm ${isSelected ? 'text-purple-300 font-medium' : 'text-slate-300'}`}>{text}</span>
                                    <span className="text-xs text-slate-500">{pct}% ({optVotes})</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${barColor} transition-all duration-700`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {isActive && !hasVoted && (
                        <p className="text-xs text-slate-500 mt-2">Clique em uma opção para votar</p>
                      )}
                      {hasVoted && (
                        <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                          <CheckCircle2 className="w-3 h-3" /> Voto registrado
                        </p>
                      )}
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
