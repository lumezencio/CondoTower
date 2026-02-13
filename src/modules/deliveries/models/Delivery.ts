import { PrismaClient, Encomenda as PrismaEncomenda } from '@prisma/client';

export interface EncomendaData {
  id?: string;
  tipo: 'correios' | 'sedex' | 'transportadora' | 'entregador' | 'outro';
  remetente: string;
  descricao?: string;
  condominioId: string;
  apartamentoId: string;
  dataRecebimento: Date;
  dataRetirada?: Date;
  retiradoPor?: string;
  observacoes?: string;
  status: 'aguardando_retirada' | 'retirada' | 'entregue';
  createdAt?: Date;
  updatedAt?: Date;
}

export class EncomendaModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: EncomendaData): Promise<EncomendaData> {
    const encomenda = await this.prisma.encomenda.create({
      data: {
        tipo: this.mapTipoToPrisma(data.tipo),
        remetente: data.remetente,
        descricao: data.descricao,
        condominio_id: data.condominioId,
        apartamento_id: data.apartamentoId,
        data_recebimento: data.dataRecebimento,
        data_retirada: data.dataRetirada,
        retirado_por: data.retiradoPor,
        observacoes: data.observacoes,
        status: this.mapStatusToPrisma(data.status),
      },
    });
    return this.mapPrismaToInterface(encomenda);
  }

  async findById(id: string): Promise<EncomendaData | null> {
    const encomenda = await this.prisma.encomenda.findUnique({
      where: { id },
    });
    return encomenda ? this.mapPrismaToInterface(encomenda) : null;
  }

  async findAll(condominiumId: string, filters?: any): Promise<EncomendaData[]> {
    const encomendas = await this.prisma.encomenda.findMany({
      where: {
        condominio_id: condominiumId,
        ...filters,
      },
      orderBy: {
        data_recebimento: 'desc',
      },
    });
    return encomendas.map(encomenda => this.mapPrismaToInterface(encomenda));
  }

  async update(id: string, data: Partial<EncomendaData>): Promise<EncomendaData> {
    const updatedEncomenda = await this.prisma.encomenda.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedEncomenda);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.encomenda.delete({
      where: { id },
    });
  }

  async markAsRetirada(id: string, retiradoPor: string): Promise<EncomendaData> {
    const updatedEncomenda = await this.prisma.encomenda.update({
      where: { id },
      data: {
        status: 'RETIRADA',
        data_retirada: new Date(),
        retirado_por: retiradoPor,
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedEncomenda);
  }

  async getEncomendasAguardandoRetirada(condominiumId: string): Promise<EncomendaData[]> {
    const encomendas = await this.prisma.encomenda.findMany({
      where: {
        condominio_id: condominiumId,
        status: 'AGUARDANDO_RETIRADA',
      },
      orderBy: {
        data_recebimento: 'asc',
      },
    });
    return encomendas.map(encomenda => this.mapPrismaToInterface(encomenda));
  }

  private mapPrismaToInterface(prismaEncomenda: PrismaEncomenda): EncomendaData {
    return {
      id: prismaEncomenda.id,
      tipo: this.mapTipoFromPrisma(prismaEncomenda.tipo),
      remetente: prismaEncomenda.remetente,
      descricao: prismaEncomenda.descricao || undefined,
      condominioId: prismaEncomenda.condominio_id,
      apartamentoId: prismaEncomenda.apartamento_id,
      dataRecebimento: prismaEncomenda.data_recebimento,
      dataRetirada: prismaEncomenda.data_retirada || undefined,
      retiradoPor: prismaEncomenda.retirado_por || undefined,
      observacoes: prismaEncomenda.observacoes || undefined,
      status: this.mapStatusFromPrisma(prismaEncomenda.status),
      createdAt: prismaEncomenda.created_at,
      updatedAt: prismaEncomenda.updated_at,
    };
  }

  private mapTipoToPrisma(tipo: string): string {
    switch(tipo) {
      case 'correios': return 'CORREIOS';
      case 'sedex': return 'SEDEX';
      case 'transportadora': return 'TRANSPORTADORA';
      case 'entregador': return 'ENTREGADOR';
      case 'outro': return 'OUTRO';
      default: return 'OUTRO';
    }
  }

  private mapTipoFromPrisma(tipo: string): 'correios' | 'sedex' | 'transportadora' | 'entregador' | 'outro' {
    switch(tipo) {
      case 'CORREIOS': return 'correios';
      case 'SEDEX': return 'sedex';
      case 'TRANSPORTADORA': return 'transportadora';
      case 'ENTREGADOR': return 'entregador';
      case 'OUTRO': return 'outro';
      default: return 'outro';
    }
  }

  private mapStatusToPrisma(status: string): string {
    switch(status) {
      case 'aguardando_retirada': return 'AGUARDANDO_RETIRADA';
      case 'retirada': return 'RETIRADA';
      case 'entregue': return 'ENTREGUE';
      default: return 'AGUARDANDO_RETIRADA';
    }
  }

  private mapStatusFromPrisma(status: string): 'aguardando_retirada' | 'retirada' | 'entregue' {
    switch(status) {
      case 'AGUARDANDO_RETIRADA': return 'aguardando_retirada';
      case 'RETIRADA': return 'retirada';
      case 'ENTREGUE': return 'entregue';
      default: return 'aguardando_retirada';
    }
  }
}