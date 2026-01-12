'use client';

import { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  Car,
  TrendingUp,
  AlertCircle,
  CalendarCheck,
  Wallet,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';

interface DashboardStats {
  totalUnits: number;
  totalResidents: number;
  totalVehicles: number;
  occupancyRate: number;
}

interface RecentActivity {
  id: string;
  type: 'unit' | 'resident' | 'vehicle' | 'payment';
  description: string;
  time: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUnits: 0,
    totalResidents: 0,
    totalVehicles: 0,
    occupancyRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // Carregar estatísticas das APIs
        const [unitsRes, residentsRes, vehiclesRes] = await Promise.all([
          fetch('/api/units?pageSize=1'),
          fetch('/api/residents?pageSize=1'),
          fetch('/api/vehicles?pageSize=1'),
        ]);

        const [unitsData, residentsData, vehiclesData] = await Promise.all([
          unitsRes.json(),
          residentsRes.json(),
          vehiclesRes.json(),
        ]);

        const totalUnits = unitsData?.total ?? 0;
        const totalResidents = residentsData?.total ?? 0;
        const totalVehicles = vehiclesData?.total ?? 0;

        // Calcular taxa de ocupação (unidades com moradores / total de unidades)
        const occupancyRate = totalUnits > 0 ? Math.round((totalResidents / totalUnits) * 100) : 0;

        setStats({
          totalUnits,
          totalResidents,
          totalVehicles,
          occupancyRate: Math.min(occupancyRate, 100),
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const recentActivities: RecentActivity[] = [
    { id: '1', type: 'resident', description: 'Novo morador cadastrado: João Silva', time: 'Há 5 min' },
    { id: '2', type: 'vehicle', description: 'Veículo ABC-1234 registrado', time: 'Há 15 min' },
    { id: '3', type: 'unit', description: 'Unidade B-202 atualizada', time: 'Há 1 hora' },
    { id: '4', type: 'payment', description: 'Taxa condominial recebida', time: 'Há 2 horas' },
  ];

  const activityIcons = {
    unit: Building2,
    resident: Users,
    vehicle: Car,
    payment: Wallet,
  };

  const activityColors = {
    unit: 'text-indigo-400 bg-indigo-500/20',
    resident: 'text-emerald-400 bg-emerald-500/20',
    vehicle: 'text-amber-400 bg-amber-500/20',
    payment: 'text-cyan-400 bg-cyan-500/20',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Visão geral do seu condomínio
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Unidades */}
        <StatCard
          title="Total de Unidades"
          value={stats.totalUnits}
          icon={Building2}
          color="indigo"
          loading={loading}
          trend={{ value: 5, positive: true }}
        />

        {/* Moradores */}
        <StatCard
          title="Moradores"
          value={stats.totalResidents}
          icon={Users}
          color="emerald"
          loading={loading}
          trend={{ value: 12, positive: true }}
        />

        {/* Veículos */}
        <StatCard
          title="Veículos"
          value={stats.totalVehicles}
          icon={Car}
          color="amber"
          loading={loading}
          trend={{ value: 3, positive: true }}
        />

        {/* Taxa de Ocupação */}
        <StatCard
          title="Taxa de Ocupação"
          value={`${stats.occupancyRate}%`}
          icon={TrendingUp}
          color="cyan"
          loading={loading}
          trend={{ value: 2, positive: true }}
        />
      </div>

      {/* Seção Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resumo Financeiro */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-cyan-400" />
              Resumo Financeiro
            </h2>
            <span className="text-xs text-slate-400">Últimos 30 dias</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-sm text-slate-400 mb-1">Arrecadação</div>
              <div className="text-2xl font-bold text-emerald-400">R$ 45.680</div>
              <div className="flex items-center gap-1 text-xs text-emerald-400 mt-2">
                <ArrowUpRight className="w-3 h-3" />
                +8.2% vs mês anterior
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="text-sm text-slate-400 mb-1">Inadimplência</div>
              <div className="text-2xl font-bold text-red-400">R$ 3.240</div>
              <div className="flex items-center gap-1 text-xs text-red-400 mt-2">
                <ArrowDownRight className="w-3 h-3" />
                -2.1% vs mês anterior
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-slate-400 mb-1">Despesas</div>
              <div className="text-2xl font-bold text-blue-400">R$ 28.450</div>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                <Activity className="w-3 h-3" />
                Dentro do orçamento
              </div>
            </div>
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-purple-400" />
            Atividade Recente
          </h2>

          <div className="space-y-3">
            {recentActivities.map((activity) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition"
                >
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cards de Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <QuickActionCard
          title="Chamados Abertos"
          value="4"
          description="2 urgentes"
          icon={AlertCircle}
          color="red"
          href="/dashboard/chamados"
        />
        <QuickActionCard
          title="Reservas Hoje"
          value="3"
          description="Salão de festas"
          icon={CalendarCheck}
          color="purple"
          href="/dashboard/eventos"
        />
        <QuickActionCard
          title="Documentos"
          value="28"
          description="3 novos"
          icon={FileText}
          color="blue"
          href="/dashboard/documentos"
        />
        <QuickActionCard
          title="Comunicados"
          value="5"
          description="Esta semana"
          icon={FileText}
          color="green"
          href="/dashboard/comunicados"
        />
      </div>
    </div>
  );
}

// Componente de Card de Estatística
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  loading,
  trend,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'purple' | 'red' | 'blue' | 'green';
  loading?: boolean;
  trend?: { value: number; positive: boolean };
}) {
  const colorClasses = {
    indigo: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30',
    emerald: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    amber: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    cyan: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
    purple: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    red: 'text-red-400 bg-red-500/20 border-red-500/30',
    blue: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    green: 'text-green-400 bg-green-500/20 border-green-500/30',
  };

  const iconBgClass = colorClasses[color].split(' ').slice(1).join(' ');
  const textClass = colorClasses[color].split(' ')[0];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-slate-700 animate-pulse rounded mt-1" />
          ) : (
            <p className={`text-2xl font-bold mt-1 ${textClass}`}>{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBgClass}`}>
          <Icon className={`w-5 h-5 ${textClass}`} />
        </div>
      </div>

      {trend && !loading && (
        <div className="flex items-center gap-1 mt-3 text-xs">
          {trend.positive ? (
            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
          ) : (
            <ArrowDownRight className="w-3 h-3 text-red-400" />
          )}
          <span className={trend.positive ? 'text-emerald-400' : 'text-red-400'}>
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-slate-500">vs mês anterior</span>
        </div>
      )}
    </div>
  );
}

// Componente de Card de Ação Rápida
function QuickActionCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'purple' | 'red' | 'blue' | 'green';
  href: string;
}) {
  const colorClasses = {
    indigo: 'text-indigo-400 bg-indigo-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/20',
    purple: 'text-purple-400 bg-purple-500/20',
    red: 'text-red-400 bg-red-500/20',
    blue: 'text-blue-400 bg-blue-500/20',
    green: 'text-green-400 bg-green-500/20',
  };

  const textClass = colorClasses[color].split(' ')[0];
  const bgClass = colorClasses[color].split(' ')[1];

  return (
    <a
      href={href}
      className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 hover:bg-white/10 hover:border-white/20 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${bgClass}`}>
          <Icon className={`w-5 h-5 ${textClass}`} />
        </div>
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-bold ${textClass}`}>{value}</span>
            <span className="text-xs text-slate-500">{description}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
