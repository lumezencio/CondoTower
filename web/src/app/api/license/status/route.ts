import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getLicenseStatus } from '@/lib/license-service';

/**
 * GET /api/license/status
 * Retorna o status da licença do tenant atual
 */
export async function GET() {
  try {
    // Obtém o tenant do cookie de autenticação
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth');
    let tenant = 'parkclub'; // Default

    if (authCookie?.value) {
      try {
        const payload = JSON.parse(
          Buffer.from(authCookie.value, 'base64url').toString('utf8')
        );
        tenant = payload.t || 'parkclub';
      } catch {
        // Usa tenant padrão
      }
    }

    const status = await getLicenseStatus(tenant);

    return NextResponse.json(status);
  } catch (error) {
    console.error('LICENSE_STATUS_ERROR:', error);
    return NextResponse.json(
      {
        isOnline: false,
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
          connection: 'offline',
        },
        tenant: 'parkclub',
        systemId: 'condotower',
      },
      { status: 200 }
    );
  }
}
