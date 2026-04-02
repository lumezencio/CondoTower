/**
 * CONDOTOWER - License Service
 * Integração isolada com o License Server
 * Sistema: CondoTower (SaaS Multi-tenant)
 *
 * IMPORTANTE: Este serviço é específico do CondoTower.
 * Cada sistema (Tech-EMP, etc.) deve ter sua própria implementação.
 */

export interface LicenseStatus {
  isOnline: boolean;
  isValid: boolean;
  plan: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  daysRemaining: number;
  expiresAt: string | null;
  modules: LicenseModule[];
  systemStatus: SystemStatus;
  tenant: string;
  systemId: string;
}

export interface LicenseModule {
  id: string;
  name: string;
  enabled: boolean;
}

export interface SystemStatus {
  database: 'online' | 'offline' | 'error';
  api: 'online' | 'offline' | 'error';
  connection: 'online' | 'offline' | 'error';
}

// Configuração do License Server (isolada para CondoTower)
const LICENSE_SERVER_URL = process.env.NEXT_PUBLIC_LICENSE_SERVER_URL || 'http://localhost:4000';
const SYSTEM_ID = 'condotower'; // Identificador único do sistema

// Cache local para evitar requisições excessivas
let cachedStatus: LicenseStatus | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30000; // 30 segundos

/**
 * Obtém o status da licença do License Server
 * Retorna dados mockados se o servidor não estiver disponível
 */
export async function getLicenseStatus(tenant: string): Promise<LicenseStatus> {
  const now = Date.now();

  // Retorna cache se ainda válido
  if (cachedStatus && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedStatus;
  }

  try {
    const response = await fetch(`${LICENSE_SERVER_URL}/api/license/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemId: SYSTEM_ID,
        tenant,
      }),
      // Timeout de 5 segundos
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      cachedStatus = {
        isOnline: true,
        isValid: data.isValid ?? true,
        plan: data.plan ?? 'PREMIUM',
        daysRemaining: data.daysRemaining ?? 365,
        expiresAt: data.expiresAt ?? null,
        modules: data.modules ?? getDefaultModules(),
        systemStatus: {
          database: 'online',
          api: 'online',
          connection: 'online',
        },
        tenant,
        systemId: SYSTEM_ID,
      };
      cacheTimestamp = now;
      return cachedStatus;
    }
  } catch {
    // License Server não disponível - usar modo offline
  }

  // Fallback: modo offline com dados locais/mockados
  return getOfflineStatus(tenant);
}

/**
 * Status offline quando License Server não está disponível
 * Em produção, isso poderia usar dados cacheados localmente
 */
function getOfflineStatus(tenant: string): LicenseStatus {
  return {
    isOnline: false,
    isValid: true, // Assume válido em modo offline por graça
    plan: 'PREMIUM',
    daysRemaining: 454, // Mockado conforme imagem do usuário
    expiresAt: calculateExpiryDate(454),
    modules: getDefaultModules(),
    systemStatus: {
      database: 'online',
      api: 'online',
      connection: 'offline', // Conexão com License Server offline
    },
    tenant,
    systemId: SYSTEM_ID,
  };
}

/**
 * Módulos padrão do CondoTower
 */
function getDefaultModules(): LicenseModule[] {
  return [
    { id: 'sistema', name: 'Sistema', enabled: true },
    { id: 'banco', name: 'Banco', enabled: true },
    { id: 'modulos', name: 'Módulos', enabled: true },
    { id: 'conexao', name: 'Conexão', enabled: true },
    { id: 'indices', name: 'Índices', enabled: true },
  ];
}

function calculateExpiryDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

/**
 * Verifica se o sistema está online (ping)
 */
export async function pingLicenseServer(): Promise<boolean> {
  try {
    const response = await fetch(`${LICENSE_SERVER_URL}/api/ping`, {
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Verifica status dos módulos específicos
 */
export async function checkModuleStatus(moduleId: string, tenant: string): Promise<boolean> {
  const status = await getLicenseStatus(tenant);
  const module = status.modules.find(m => m.id === moduleId);
  return module?.enabled ?? false;
}

/**
 * Limpa cache (útil após renovação de licença)
 */
export function clearLicenseCache(): void {
  cachedStatus = null;
  cacheTimestamp = 0;
}
