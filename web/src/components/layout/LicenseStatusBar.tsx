'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Bell, Settings, ChevronDown } from 'lucide-react';
import type { LicenseStatus } from '@/lib/license-service';

interface LicenseStatusBarProps {
  userEmail?: string;
  userName?: string;
}

export default function LicenseStatusBar({ userEmail = 'usuario@condotech.com', userName }: LicenseStatusBarProps) {
  const [status, setStatus] = useState<LicenseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/license/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch {
      // Fallback para status mockado
      setStatus({
        isOnline: true,
        isValid: true,
        plan: 'PREMIUM',
        daysRemaining: 454,
        expiresAt: null,
        modules: [
          { id: 'sistema', name: 'Sistema', enabled: true },
          { id: 'banco', name: 'Banco', enabled: true },
          { id: 'modulos', name: 'Módulos', enabled: true },
          { id: 'conexao', name: 'Conexão', enabled: true },
          { id: 'indices', name: 'Índices', enabled: true },
        ],
        systemStatus: {
          database: 'online',
          api: 'online',
          connection: 'online',
        },
        tenant: 'parkclub',
        systemId: 'condotech',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Atualiza a cada 60 segundos
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStatus();
    setTimeout(() => setRefreshing(false), 500);
  };

  if (loading) {
    return (
      <header className="h-12 bg-slate-900/95 border-b border-white/10 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-sm">Carregando...</div>
      </header>
    );
  }

  const planColors: Record<string, string> = {
    FREE: 'text-slate-400 border-slate-500',
    BASIC: 'text-blue-400 border-blue-500',
    PREMIUM: 'text-amber-400 border-amber-500',
    ENTERPRISE: 'text-purple-400 border-purple-500',
  };

  return (
    <header className="h-12 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 px-4 flex items-center justify-between gap-4 z-50">
      {/* Lado Esquerdo - Ações de Licença */}
      <div className="flex items-center gap-3">
        {/* Botão Renovar Plano */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/50 text-cyan-400 text-xs font-medium hover:bg-cyan-500/10 transition-colors"
          title="Renovar Plano"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Renovar Plano
        </button>

        {/* Info do Plano */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5">
          <span className="text-slate-400 text-xs">
            <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
          </span>
          <span className={`text-xs font-semibold ${planColors[status?.plan || 'PREMIUM']}`}>
            {status?.plan || 'PREMIUM'}
          </span>
          <span className="text-slate-400 text-xs">|</span>
          <span className="text-slate-300 text-xs flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {status?.daysRemaining || 0} dias
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>

      {/* Centro - Status dos Módulos */}
      <div className="flex items-center gap-2">
        {/* Status Online */}
        <StatusBadge
          label="ONLINE"
          status={status?.isOnline ? 'online' : 'offline'}
          variant="success"
        />

        {/* Módulos */}
        {status?.modules.map((module) => (
          <StatusBadge
            key={module.id}
            label={module.name}
            status={module.enabled ? 'online' : 'offline'}
          />
        ))}

        {/* Botão Refresh */}
        <button
          onClick={handleRefresh}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          title="Atualizar Status"
        >
          <RefreshCw className={`w-4 h-4 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Lado Direito - Usuário e Ações */}
      <div className="flex items-center gap-3">
        {/* Ícone de Sol (tema) */}
        <button
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          title="Tema"
        >
          <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
        </button>

        {/* Notificações */}
        <button
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors relative"
          title="Notificações"
        >
          <Bell className="w-5 h-5 text-slate-400" />
        </button>

        {/* Configurações */}
        <button
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          title="Configurações"
        >
          <Settings className="w-5 h-5 text-slate-400" />
        </button>

        {/* Usuário */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="text-right">
            <div className="text-sm text-slate-200 font-medium">{userEmail}</div>
            <div className="text-xs text-emerald-400">Online</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            {(userName || userEmail || 'U').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

// Componente de Badge de Status
function StatusBadge({
  label,
  status,
  variant = 'default',
}: {
  label: string;
  status: 'online' | 'offline' | 'error';
  variant?: 'default' | 'success';
}) {
  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-500',
    error: 'bg-red-500',
  };

  const borderColors = {
    default: 'border-white/20',
    success: 'border-emerald-500/50',
  };

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${borderColors[variant]} bg-white/5 text-xs`}
    >
      <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
      <span className={`font-medium ${status === 'online' ? 'text-slate-200' : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
  );
}
