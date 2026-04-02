'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  ArrowRight
} from 'lucide-react';

interface TicketSummary {
  total: number;
  abertos: number;
  emAnalise: number;
  aprovados: number;
  aguardandoPecas: number;
  emAndamento: number;
  concluidos: number;
  cancelados: number;
  byTipo: Record<string, number>;
  byCategoria: Record<string, number>;
  byPrioridade: Record<string, number>;
  custoTotal: number;
}

interface TicketDashboardProps {
  summary?: TicketSummary;
  onNavigate?: (section: string) => void;
  recentTickets?: any[];
  loading?: boolean;
}

const TicketDashboard: React.FC<TicketDashboardProps> = ({
  summary,
  onNavigate,
  recentTickets = [],
  loading = false,
}) => {
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    trend 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    color: string;
    trend?: string;
  }) => (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-neutral-900 mb-1">{value}</h3>
      <p className="text-sm text-neutral-500">{title}</p>
    </motion.div>
  );

  const defaultSummary: TicketSummary = {
    total: 0,
    abertos: 0,
    emAnalise: 0,
    aprovados: 0,
    aguardandoPecas: 0,
    emAndamento: 0,
    concluidos: 0,
    cancelados: 0,
    byTipo: {},
    byCategoria: {},
    byPrioridade: {},
    custoTotal: 0,
  };

  const data = summary || defaultSummary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Chamados</h1>
          <p className="text-neutral-500 mt-1">
            Acompanhe e gerencie as solicitações de manutenção e serviços
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Chamados"
          value={data.total}
          icon={<FileText className="w-5 h-5 text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          title="Em Aberto"
          value={data.abertos + data.emAnalise + data.emAndamento}
          icon={<Clock className="w-5 h-5 text-yellow-600" />}
          color="bg-yellow-100"
        />
        <StatCard
          title="Concluídos"
          value={data.concluidos}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          color="bg-green-100"
          trend="+12%"
        />
        <StatCard
          title="Custo Total"
          value={formatCurrency(data.custoTotal)}
          icon={<DollarSign className="w-5 h-5 text-purple-600" />}
          color="bg-purple-100"
        />
      </div>

      {/* Gráficos e Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por Tipo */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Chamados por Tipo</h3>
          <div className="space-y-3">
            {Object.entries(data.byTipo).map(([tipo, quantidade]) => (
              <div key={tipo} className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 capitalize">
                  {tipo.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(quantidade / data.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-neutral-900 w-8 text-right">
                    {quantidade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Por Prioridade */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Chamados por Prioridade</h3>
          <div className="space-y-3">
            {Object.entries(data.byPrioridade).map(([prioridade, quantidade]) => {
              const colors: Record<string, string> = {
                baixa: 'bg-slate-500',
                media: 'bg-blue-500',
                alta: 'bg-orange-500',
                urgente: 'bg-red-500',
                emergencia: 'bg-red-600',
              };
              return (
                <div key={prioridade} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 capitalize">
                    {prioridade.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[prioridade]} rounded-full`}
                        style={{ width: `${(quantidade / data.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-neutral-900 w-8 text-right">
                      {quantidade}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Por Categoria */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Chamados por Categoria</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(data.byCategoria)
              .filter(([_, quantidade]) => quantidade > 0)
              .slice(0, 8)
              .map(([categoria, quantidade]) => (
                <div
                  key={categoria}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                >
                  <span className="text-sm text-neutral-600 capitalize">
                    {categoria.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-semibold text-neutral-900">
                    {quantidade}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Status dos Chamados</h3>
          <div className="space-y-3">
            {[
              { key: 'abertos', label: 'Abertos', color: 'bg-blue-500' },
              { key: 'emAnalise', label: 'Em Análise', color: 'bg-yellow-500' },
              { key: 'aprovados', label: 'Aprovados', color: 'bg-indigo-500' },
              { key: 'aguardandoPecas', label: 'Aguardando Peças', color: 'bg-orange-500' },
              { key: 'emAndamento', label: 'Em Andamento', color: 'bg-purple-500' },
              { key: 'concluidos', label: 'Concluídos', color: 'bg-green-500' },
              { key: 'cancelados', label: 'Cancelados', color: 'bg-red-500' },
            ].map((status) => (
              <div key={status.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${status.color}`} />
                  <span className="text-sm text-neutral-600">{status.label}</span>
                </div>
                <span className="text-sm font-semibold text-neutral-900">
                  {data[status.key as keyof TicketSummary] as number}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chamados Recentes */}
      {recentTickets.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900">Chamados Recentes</h3>
            {onNavigate && (
              <button
                onClick={() => onNavigate('list')}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="divide-y divide-neutral-100">
            {recentTickets.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="p-4 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-900">{ticket.titulo}</h4>
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-1">
                      {ticket.descricao}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                      <span className="capitalize">{ticket.tipo.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span>{ticket.categoria.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    ticket.status === 'concluido' ? 'bg-green-100 text-green-800 border-green-200' :
                    ticket.status === 'cancelado' ? 'bg-red-100 text-red-800 border-red-200' :
                    'bg-blue-100 text-blue-800 border-blue-200'
                  }`}>
                    {ticket.status === 'concluido' ? 'Concluído' :
                     ticket.status === 'cancelado' ? 'Cancelado' :
                     ticket.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDashboard;
