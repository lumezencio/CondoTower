'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Calendar, MapPin, Clock, CheckCircle2,
  XCircle, Loader2, X, Eye, RefreshCw, FileText, ChevronDown, ChevronUp,
} from 'lucide-react';

interface Meeting {
  id: string;
  type: string;
  title: string;
  description: string;
  agenda: string;
  scheduledFor: string;
  location?: string;
  status: string;
}

const TYPE_LABELS: Record<string, string> = {
  ORDINARIA:      'Ordinária',
  EXTRAORDINARIA: 'Extraordinária',
  VIRTUAL:        'Virtual',
};

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  AGENDADA:  { label: 'Agendada',  cls: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',           dot: 'bg-blue-400' },
  EM_CURSO:  { label: 'Em Curso',  cls: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',         dot: 'bg-amber-400' },
  CONCLUIDA: { label: 'Concluída', cls: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',   dot: 'bg-emerald-400' },
  CANCELADA: { label: 'Cancelada', cls: 'bg-red-500/20 text-red-300 border border-red-500/30',               dot: 'bg-red-400' },
};

function formatDate(d: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(d));
}
function formatShort(d: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(d));
}

export default function AssembleiaPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({ tenant: 'parkclub', page: '1', pageSize: '50' });
    if (filterStatus) params.set('status', filterStatus);
    const res = await fetch(`/api/meetings?${params}`);
    const data = await res.json();
    if (data.ok) setMeetings(data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterStatus]);

  const counts = {
    total:     meetings.length,
    agendada:  meetings.filter(m => m.status === 'AGENDADA').length,
    emCurso:   meetings.filter(m => m.status === 'EM_CURSO').length,
    concluida: meetings.filter(m => m.status === 'CONCLUIDA').length,
  };

  const selectCls = 'bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 border border-orange-500/30">
              <Users className="w-6 h-6 text-orange-400" />
            </div>
            Assembleia Virtual
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Reuniões e assembleias do condomínio</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 border border-slate-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:from-orange-400 hover:to-amber-400 transition-all">
            <Plus className="w-4 h-4" />
            Nova Assembleia
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total',      value: counts.total,     color: 'border-slate-600',   iconCls: 'text-slate-400',   icon: Users },
          { label: 'Agendadas',  value: counts.agendada,  color: 'border-blue-500',    iconCls: 'text-blue-400',    icon: Calendar },
          { label: 'Em Curso',   value: counts.emCurso,   color: 'border-amber-500',   iconCls: 'text-amber-400',   icon: Clock },
          { label: 'Concluídas', value: counts.concluida, color: 'border-emerald-500', iconCls: 'text-emerald-400', icon: CheckCircle2 },
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

      {/* Meeting Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center py-16 text-slate-500">
            <Users className="w-12 h-12 mb-3 opacity-30" />
            <p>Nenhuma assembleia encontrada</p>
          </div>
        ) : (
          meetings.map(meeting => {
            const sCfg = STATUS_CONFIG[meeting.status] ?? STATUS_CONFIG.AGENDADA;
            const isExpanded = expanded === meeting.id;
            return (
              <div key={meeting.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="p-2.5 rounded-xl bg-orange-500/20 border border-orange-500/30 flex-shrink-0">
                      <Users className="w-5 h-5 text-orange-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/50">
                          {TYPE_LABELS[meeting.type] ?? meeting.type}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${sCfg.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot} ${meeting.status === 'EM_CURSO' ? 'animate-pulse' : ''}`} />
                          {sCfg.label}
                        </span>
                      </div>

                      <h3 className="text-slate-100 font-semibold text-base mb-2">{meeting.title}</h3>
                      <p className="text-slate-400 text-sm line-clamp-2">{meeting.description}</p>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {formatShort(meeting.scheduledFor)}
                        </span>
                        {meeting.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {meeting.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setExpanded(isExpanded ? null : meeting.id)}
                      className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expanded: Agenda */}
                  {isExpanded && (
                    <div className="mt-4 ml-14">
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-cyan-400 text-xs uppercase tracking-wider font-semibold">Pauta</span>
                        </div>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{meeting.agenda}</p>
                      </div>

                      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>Data completa: {formatDate(meeting.scheduledFor)}</span>
                      </div>
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
