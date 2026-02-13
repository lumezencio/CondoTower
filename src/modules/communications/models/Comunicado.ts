import { PrismaClient, Comunicado as PrismaComunicado } from '@prisma/client';

export interface ComunicadoData {
  id?: string;
  titulo: string;
  conteudo: string;
  tipo: 'aviso_geral' | 'manutencao' | 'assembleia' | 'evento' | 'seguranca' | 'regra';
  prioridade: 'baixa' | 'normal' | 'alta' | 'urgente';
  fixado: boolean;
  anexos?: string[];
  autorId: string;
  condominioId: string;
  dataPublicacao?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ComunicadoModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: ComunicadoData): Promise<ComunicadoData> {
    const comunicado = await this.prisma.comunicado.create({
      data: {
        titulo: data.titulo,
        conteudo: data.conteudo,
        tipo: this.mapTipoToPrisma(data.tipo),
        prioridade: this.mapPrioridadeToPrisma(data.prioridade),
        fixado: data.fixado,
        anexos: data.anexos || [],
        autor_id: data.autorId,
        condominio_id: data.condominioId,
        data_publicacao: data.dataPublicacao || new Date(),
      },
    });
    return this.mapPrismaToInterface(comunicado);
  }

  async findById(id: string): Promise<ComunicadoData | null> {
    const comunicado = await this.prisma.comunicado.findUnique({
      where: { id },
    });
    return comunicado ? this.mapPrismaToInterface(comunicado) : null;
  }

  async findAll(condominiumId: string, filters?: any): Promise<ComunicadoData[]> {
    const comunicados = await this.prisma.comunicado.findMany({
      where: {
        condominio_id: condominiumId,
        ...filters,
      },
      orderBy: {
        data_publicacao: 'desc',
      },
    });
    return comunicados.map(comunicado => this.mapPrismaToInterface(comunicado));
  }

  async update(id: string, data: Partial<ComunicadoData>): Promise<ComunicadoData> {
    const updatedComunicado = await this.prisma.comunicado.update({
      where: { id },
      data: {
        ...data,
        anexos: data.anexos || undefined,
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedComunicado);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comunicado.delete({
      where: { id },
    });
  }

  async pin(id: string): Promise<ComunicadoData> {
    const updatedComunicado = await this.prisma.comunicado.update({
      where: { id },
      data: {
        fixado: true,
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedComunicado);
  }

  async unpin(id: string): Promise<ComunicadoData> {
    const updatedComunicado = await this.prisma.comunicado.update({
      where: { id },
      data: {
        fixado: false,
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedComunicado);
  }

  async getFixedMessages(condominiumId: string): Promise<ComunicadoData[]> {
    const comunicados = await this.prisma.comunicado.findMany({
      where: {
        condominio_id: condominiumId,
        fixado: true,
      },
      orderBy: {
        data_publicacao: 'desc',
      },
    });
    return comunicados.map(comunicado => this.mapPrismaToInterface(comunicado));
  }

  private mapPrismaToInterface(prismaComunicado: PrismaComunicado): ComunicadoData {
    return {
      id: prismaComunicado.id,
      titulo: prismaComunicado.titulo,
      conteudo: prismaComunicado.conteudo,
      tipo: this.mapTipoFromPrisma(prismaComunicado.tipo),
      prioridade: this.mapPrioridadeFromPrisma(prismaComunicado.prioridade),
      fixado: prismaComunicado.fixado,
      anexos: prismaComunicado.anexos as string[],
      autorId: prismaComunicado.autor_id,
      condominioId: prismaComunicado.condominio_id,
      dataPublicacao: prismaComunicado.data_publicacao,
      createdAt: prismaComunicado.created_at,
      updatedAt: prismaComunicado.updated_at,
    };
  }

  private mapTipoToPrisma(tipo: string): string {
    switch(tipo) {
      case 'aviso_geral': return 'AVISO_GERAL';
      case 'manutencao': return 'MANUTENCAO';
      case 'assembleia': return 'ASSEMBLEIA';
      case 'evento': return 'EVENTO';
      case 'seguranca': return 'SEGURANCA';
      case 'regra': return 'REGRA';
      default: return 'AVISO_GERAL';
    }
  }

  private mapTipoFromPrisma(tipo: string): 'aviso_geral' | 'manutencao' | 'assembleia' | 'evento' | 'seguranca' | 'regra' {
    switch(tipo) {
      case 'AVISO_GERAL': return 'aviso_geral';
      case 'MANUTENCAO': return 'manutencao';
      case 'ASSEMBLEIA': return 'assembleia';
      case 'EVENTO': return 'evento';
      case 'SEGURANCA': return 'seguranca';
      case 'REGRA': return 'regra';
      default: return 'aviso_geral';
    }
  }

  private mapPrioridadeToPrisma(prioridade: string): string {
    switch(prioridade) {
      case 'baixa': return 'BAIXA';
      case 'normal': return 'NORMAL';
      case 'alta': return 'ALTA';
      case 'urgente': return 'URGENTE';
      default: return 'NORMAL';
    }
  }

  private mapPrioridadeFromPrisma(prioridade: string): 'baixa' | 'normal' | 'alta' | 'urgente' {
    switch(prioridade) {
      case 'BAIXA': return 'baixa';
      case 'NORMAL': return 'normal';
      case 'ALTA': return 'alta';
      case 'URGENTE': return 'urgente';
      default: return 'normal';
    }
  }
}