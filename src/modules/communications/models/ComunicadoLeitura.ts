import { PrismaClient, ComunicadoLeitura as PrismaComunicadoLeitura } from '@prisma/client';

export interface ComunicadoLeituraData {
  id?: string;
  comunicadoId: string;
  userId: string;
  lidoEm: Date;
  createdAt?: Date;
}

export class ComunicadoLeituraModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: ComunicadoLeituraData): Promise<ComunicadoLeituraData> {
    const leitura = await this.prisma.comunicadoLeitura.create({
      data: {
        comunicado_id: data.comunicadoId,
        user_id: data.userId,
        lido_em: data.lidoEm,
      },
    });
    return this.mapPrismaToInterface(leitura);
  }

  async findByUserAndComunicado(userId: string, comunicadoId: string): Promise<ComunicadoLeituraData | null> {
    const leitura = await this.prisma.comunicadoLeitura.findUnique({
      where: {
        comunicado_id_user_id: {
          comunicado_id: comunicadoId,
          user_id: userId,
        },
      },
    });
    return leitura ? this.mapPrismaToInterface(leitura) : null;
  }

  async markAsRead(userId: string, comunicadoId: string): Promise<ComunicadoLeituraData> {
    // Verifica se já existe uma leitura registrada
    const existingLeitura = await this.findByUserAndComunicado(userId, comunicadoId);
    
    if (existingLeitura) {
      // Se já foi lido, apenas retorna o registro existente
      return existingLeitura;
    }

    // Caso contrário, cria um novo registro de leitura
    return await this.create({
      comunicadoId,
      userId,
      lidoEm: new Date(),
    });
  }

  async getUnreadCount(userId: string, condominioId: string): Promise<number> {
    // Obtém todos os comunicados do condomínio
    const allComunicados = await this.prisma.comunicado.findMany({
      where: {
        condominio_id: condominioId,
      },
      select: {
        id: true,
      },
    });

    // Obtém todos os comunicados lidos pelo usuário
    const readComunicados = await this.prisma.comunicadoLeitura.findMany({
      where: {
        user_id: userId,
      },
      select: {
        comunicado_id: true,
      },
    });

    const readIds = new Set(readComunicados.map(leitura => leitura.comunicado_id));
    const unreadCount = allComunicados.filter(comunicado => !readIds.has(comunicado.id)).length;

    return unreadCount;
  }

  private mapPrismaToInterface(prismaLeitura: PrismaComunicadoLeitura): ComunicadoLeituraData {
    return {
      id: prismaLeitura.id,
      comunicadoId: prismaLeitura.comunicado_id,
      userId: prismaLeitura.user_id,
      lidoEm: prismaLeitura.lido_em,
      createdAt: prismaLeitura.created_at,
    };
  }
}