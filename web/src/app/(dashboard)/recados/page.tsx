'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquareText, Plus, Search, Filter, Clock, CheckCircle2,
  AlertTriangle, Archive, User, RefreshCw, Trash2, Eye, X,
  ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';

interface Message {
  id: string;
  type: string;
  subject: string;
  content: string;
  priority: string;
  status: string;
  fromName: string;
  createdAt: string;
}

const PRIORITY_CONFIG: Record<string, { label: string; cls: string }> = {
  BAIXA:   { label: 'Baixa',   cls: 'bg-slate-500/20 text-slate-400 border border-slate-500/30' },
  NORMAL:  { label: 'Normal',  cls: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  ALTA:    { label: 'Alta',    cls: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
  URGENTE: { label: 'Urgente', cls: 'bg-red-500/20 text-red-300 border border-red-500/30' },
};

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDENTE:   { label: 'Pendente',   cls: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',   icon: Clock },
  EM_ANALISE: { label: 'Em Análise', cls: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',     icon: RefreshCw },
  RESPONDIDO: { label: 'Respondido', cls: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30', icon: CheckCircle2 },
  ARQUIVADO:  { label: 'Arquivado',  cls: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',  icon: Archive },
};

const TYPE_LABELS: Record<string, string> = {
  RECLAMACAO: 'Reclamação',
  SUGESTAO: 'Sugestão',
  ELOGIO: 'Elogio',
  SOLICITACAO: 'Solicitação',
  OUTRO: 'Outro',
};

function formatDate(d: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(d));
}

export default function RecadosPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const [viewMsg, setViewMsg] = useState<Message | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ subject: '', content: '', type: 'SOLICITACAO', priority: 'NORMAL' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({ tenant: 'parkclub', page: String(page), pageSize: String(pageSize) });
    if (search) params.set('search', search);
    if (filterStatus) params.set('status', filterStatus);
    if (filterPriority) params.set('priority', filterPriority);
    const res = await fetch(`/api/messages?${params}`);
    const data = await res.json();
    if (data.ok) { setMessages(data.data); setTotal(data.total ?? data.data.length); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, filterStatus, filterPriority]);
  useEffect(() => { setPage(1); load(); }, [search]);

  const handleSave = async () => {
    if (!formData.subject.trim() || !formData.content.trim()) return;
    setSaving(true);
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, tenant: 'parkclub', fromName: 'Admin' }),
    });
    setSaving(false);
    setShowForm(false);
    setFormData({ subject: '', content: '', type: 'SOLICITACAO', priority: 'NORMAL' });
    load();
  };

  const totalPages = Math.ceil(total / pageSize);
  const counts = {
    total: total,
    pendente: messages.filter(m => m.status === 'PENDENTE').length,
    respondido: messages.filter(m => m.status === 'RESPONDIDO').length,
    urgente: messages.filter(m => m.priority === 'URGENTE').length,
  };

  const inputCls = 'bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-500';
  const selectCls = `${inputCls} cursor-pointer`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30">
              <MessageSquareText className="w-6 h-6 text-violet-400" />
            </div>
            Recados
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Gerencie comunicações internas e recados do condomínio</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:from-violet-400 hover:to-purple-400 transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Recado
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: counts.total, color: 'border-slate-600', icon: MessageSquareText, iconCls: 'text-slate-400' },
          { label: 'Pendentes', value: counts.pendente, color: 'border-amber-500', icon: Clock, iconCls: 'text-amber-400' },
          { label: 'Respondidos', value: counts.respondido, color: 'border-emerald-500', icon: CheckCircle2, iconCls: 'text-emerald-400' },
          { label: 'Urgentes', value: counts.urgente, color: 'border-red-500', icon: AlertTriangle, iconCls: 'text-red-400' },
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

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por assunto ou remetente..."
              className={`${inputCls} pl-9 w-full`}
            />
          </div>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className={selectCls}>
            <option value="">Todos os status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setPage(1); }} className={selectCls}>
            <option value="">Todas as prioridades</option>
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-slate-200 font-semibold">
            Recados
            <span className="ml-2 text-slate-500 text-sm font-normal">({total})</span>
          </h2>
          <button onClick={load} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <MessageSquareText className="w-12 h-12 mb-3 opacity-30" />
            <p>Nenhum recado encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {messages.map(msg => {
              const pCfg = PRIORITY_CONFIG[msg.priority] ?? PRIORITY_CONFIG.NORMAL;
              const sCfg = STATUS_CONFIG[msg.status] ?? STATUS_CONFIG.PENDENTE;
              const StatusIcon = sCfg.icon;
              return (
                <div
                  key={msg.id}
                  className="px-6 py-4 hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  onClick={() => setViewMsg(msg)}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-slate-100 text-sm">{msg.subject}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pCfg.cls}`}>{pCfg.label}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/50">
                          {TYPE_LABELS[msg.type] ?? msg.type}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm line-clamp-2">{msg.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{msg.fromName}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(msg.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${sCfg.cls}`}>
                        <StatusIcon className="w-3 h-3" />
                        {sCfg.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-slate-500 text-sm">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewMsg && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setViewMsg(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-violet-500 via-purple-400 to-violet-500" />
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <h2 className="text-slate-100 font-semibold">{viewMsg.subject}</h2>
                <button onClick={() => setViewMsg(null)} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {(() => {
                    const p = PRIORITY_CONFIG[viewMsg.priority] ?? PRIORITY_CONFIG.NORMAL;
                    const s = STATUS_CONFIG[viewMsg.status] ?? STATUS_CONFIG.PENDENTE;
                    return (
                      <>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.cls}`}>{p.label}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/50">
                          {TYPE_LABELS[viewMsg.type] ?? viewMsg.type}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {viewMsg.content}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />De: {viewMsg.fromName}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(viewMsg.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Form Drawer */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowForm(false)} />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col">
            <div className="h-0.5 bg-gradient-to-r from-violet-500 via-purple-400 to-violet-500" />
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-slate-100 font-semibold">Novo Recado</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <p className="text-cyan-400 text-xs uppercase tracking-wider font-semibold mb-3">Informações</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-xs mb-1.5">Assunto *</label>
                    <input
                      value={formData.subject}
                      onChange={e => setFormData(f => ({ ...f, subject: e.target.value }))}
                      placeholder="Título do recado"
                      className={`${inputCls} w-full`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 text-xs mb-1.5">Tipo</label>
                      <select value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value }))} className={`${selectCls} w-full`}>
                        {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs mb-1.5">Prioridade</label>
                      <select value={formData.priority} onChange={e => setFormData(f => ({ ...f, priority: e.target.value }))} className={`${selectCls} w-full`}>
                        {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1.5">Mensagem *</label>
                    <textarea
                      value={formData.content}
                      onChange={e => setFormData(f => ({ ...f, content: e.target.value }))}
                      placeholder="Escreva o conteúdo do recado..."
                      rows={6}
                      className={`${inputCls} w-full resize-none`}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-800 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.subject.trim() || !formData.content.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium text-sm hover:from-violet-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Enviar Recado
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
