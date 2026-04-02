import { PrismaClient, Ocorrencia as PrismaOcorrencia } from '@prisma/client';

export interface OcorrenciaData {
  id?: string;
  tipo: 'manutencao' | 'seguranca' | 'limpeza' | 'vizinhanca' | 'elevador' | 'piscina' | 'barulho' | 'outro';
  titulo: string;
  descricao: string;
  status: 'aberta' | 'em_andamento' | 'resolvida' | 'cancelada';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  local?: string;
  anexos?: string[];
  autorId: string;
  responsavelId?: string;
  condominioId: string;
  dataAbertura: Date;
  dataResolucao?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OcorrenciaComentarioData {
  id?: string;
  ocorrenciaId: string;
  autorId: string;
  comentario: string;
  createdAt?: Date;
}

export class OcorrenciaModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: OcorrenciaData): Promise<OcorrenciaData> {
    const ocorrencia = await this.prisma.ocorrencia.create({
      data: {
        tipo: this.mapTipoToPrisma(data.tipo),
        titulo: data.titulo,
        descricao: data.descricao,
        status: this.mapStatusToPrisma(data.status),
        prioridade: this.mapPrioridadeToPrisma(data.prioridade),
        local: data.local,
        anexos: data.anexos || [],
        autor_id: data.autorId,
        responsavel_id: data.responsavelId,
        condominio_id: data.condominioId,
        data_abertura: data.dataAbertura,
        data_resolucao: data.dataResolucao,
      },
    });
    return this.mapPrismaToInterface(ocorrencia);
  }

  async findById(id: string): Promise<OcorrenciaData | null> {
    const ocorrencia = await this.prisma.ocorrencia.findUnique({
      where: { id },
    });
    return ocorrencia ? this.mapPrismaToInterface(ocorrencia) : null;
  }

  async findAll(condominiumId: string, filters?: any): Promise<OcorrenciaData[]> {
    const ocorrencias = await this.prisma.ocorrencia.findMany({
      where: {
        condominio_id: condominiumId,
        ...filters,
      },
      orderBy: {
        data_abertura: 'desc',
      },
    });
    return ocorrencias.map(ocorrencia => this.mapPrismaToInterface(ocorrencia));
  }

  async update(id: string, data: Partial<OcorrenciaData>): Promise<OcorrenciaData> {
    const updatedOcorrencia = await this.prisma.ocorrencia.update({
      where: { id },
      data: {
        ...data,
        anexos: data.anexos || undefined,
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedOcorrencia);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.ocorrencia.delete({
      where: { id },
    });
  }

  async changeStatus(id: string, status: string, responsavelId?: string): Promise<OcorrenciaData> {
    const updatedOcorrencia = await this.prisma.ocorrencia.update({
      where: { id },
      data: {
        status: this.mapStatusToPrisma(status as any),
        responsavel_id: responsavelId,
        ...(status === 'resolvida' && { data_resolucao: new Date() }),
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedOcorrencia);
  }

  async assignResponsibility(id: string, responsavelId: string): Promise<OcorrenciaData> {
    const updatedOcorrencia = await this.prisma.ocorrencia.update({
      where: { id },
      data: {
        responsavel_id: responsavelId,
        status: 'EM_ANDAMENTO', // Altera o status automaticamente para em andamento
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedOcorrencia);
  }

  async getOpenOccurrences(condominiumId: string): Promise<OcorrenciaData[]> {
    const ocorrencias = await this.prisma.ocorrencia.findMany({
      where: {
        condominio_id: condominiumId,
        status: { in: ['ABERTA', 'EM_ANDAMENTO'] },
      },
      orderBy: {
        data_abertura: 'desc',
      },
    });
    return ocorrencias.map(ocorrencia => this.mapPrismaToInterface(ocorrencia));
  }

  async getResolvedOccurrences(condominiumId: string): Promise<OcorrenciaData[]> {
    const ocorrencias = await this.prisma.ocorrencia.findMany({
      where: {
        condominio_id: condominiumId,
        status: 'RESOLVIDA',
      },
      orderBy: {
        data_resolucao: 'desc',
      },
    });
    return ocorrencias.map(ocorrencia => this.mapPrismaToInterface(ocorrencia));
  }

  private mapPrismaToInterface(prismaOcorrencia: PrismaOcorrencia): OcorrenciaData {
    return {
      id: prismaOcorrencia.id,
      tipo: this.mapTipoFromPrisma(prismaOcorrencia.tipo),
      titulo: prismaOcorrencia.titulo,
      descricao: prismaOcorrencia.descricao,
      status: this.mapStatusFromPrisma(prismaOcorrencia.status),
      prioridade: this.mapPrioridadeFromPrisma(prismaOcorrencia.prioridade),
      local: prismaOcorrencia.local || undefined,
      anexos: prismaOcorrencia.anexos as string[],
      autorId: prismaOcorrencia.autor_id,
      responsavelId: prismaOcorrencia.responsavel_id || undefined,
      condominioId: prismaOcorrencia.condominio_id,
      dataAbertura: prismaOcorrencia.data_abertura,
      dataResolucao: prismaOcorrencia.data_resolucao || undefined,
      createdAt: prismaOcorrencia.created_at,
      updatedAt: prismaOcorrencia.updated_at,
    };
  }

  private mapTipoToPrisma(tipo: string): string {
    switch(tipo) {
      case 'manutencao': return 'MANUTENCAO';
      case 'seguranca': return 'SEGURANCA';
      case 'limpeza': return 'LIMPEZA';
      case 'vizinhanca': return 'VIZINHANCA';
      case 'elevador': return 'ELEVADOR';
      case 'piscina': return 'PISCINA';
      case 'barulho': return 'BARULHO';
      case 'outro': return 'OUTRO';
      default: return 'OUTRO';
    }
  }

  private mapTipoFromPrisma(tipo: string): 'manutencao' | 'seguranca' | 'limpeza' | 'vizinhanca' | 'elevador' | 'piscina' | 'barulho' | 'outro' {
    switch(tipo) {
      case 'MANUTENCAO': return 'manutencao';
      case 'SEGURANCA': return 'seguranca';
      case 'LIMPEZA': return 'limpeza';
      case 'VIZINHANCA': return 'vizinhanca';
      case 'ELEVADOR': return 'elevador';
      case 'PISCINA': return 'piscina';
      case 'BARULHO': return 'barulho';
      case 'OUTRO': return 'outro';
      default: return 'outro';
    }
  }

  private mapStatusToPrisma(status: string): string {
    switch(status) {
      case 'aberta': return 'ABERTA';
      case 'em_andamento': return 'EM_ANDAMENTO';
      case 'resolvida': return 'RESOLVIDA';
      case 'cancelada': return 'CANCELADA';
      default: return 'ABERTA';
    }
  }

  private mapStatusFromPrisma(status: string): 'aberta' | 'em_andamento' | 'resolvida' | 'cancelada' {
    switch(status) {
      case 'ABERTA': return 'aberta';
      case 'EM_ANDAMENTO': return 'em_andamento';
      case 'RESOLVIDA': return 'resolvida';
      case 'CANCELADA': return 'cancelada';
      default: return 'aberta';
    }
  }

  private mapPrioridadeToPrisma(prioridade: string): string {
    switch(prioridade) {
      case 'baixa': return 'BAIXA';
      case 'media': return 'MEDIA';
      case 'alta': return 'ALTA';
      case 'urgente': return 'URGENTE';
      default: return 'MEDIA';
    }
  }

  private mapPrioridadeFromPrisma(prioridade: string): 'baixa' | 'media' | 'alta' | 'urgente' {
    switch(prioridade) {
      case 'BAIXA': return 'baixa';
      case 'MEDIA': return 'media';
      case 'ALTA': return 'alta';
      case 'URGENTE': return 'urgente';
      default: return 'media';
    }
  }
}

export class OcorrenciaComentarioModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: OcorrenciaComentarioData): Promise<OcorrenciaComentarioData> {
    const comentario = await this.prisma.ocorrenciaComentario.create({
      data: {
        ocorrencia_id: data.ocorrenciaId,
        autor_id: data.autorId,
        comentario: data.comentario,
      },
    });
    return this.mapPrismaToInterface(comentario);
  }

  async findByOcorrenciaId(ocorrenciaId: string): Promise<OcorrenciaComentarioData[]> {
    const comentarios = await this.prisma.ocorrenciaComentario.findMany({
      where: {
        ocorrencia_id: ocorrenciaId,
      },
      orderBy: {
        created_at: 'asc',
      },
    });
    return comentarios.map(comentario => this.mapPrismaToInterface(comentario));
  }

  private mapPrismaToInterface(prismaComentario: any): OcorrenciaComentarioData {
    return {
      id: prismaComentario.id,
      ocorrenciaId: prismaComentario.ocorrencia_id,
      autorId: prismaComentario.autor_id,
      comentario: prismaComentario.comentario,
      createdAt: prismaComentario.created_at,
    };
  }
}