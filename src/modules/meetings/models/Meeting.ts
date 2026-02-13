import { PrismaClient, AssembleiaConvocacao as PrismaAssembleia, AssembleiaVotacao as PrismaVotacao, Voto as PrismaVoto } from '@prisma/client';

export interface AssembleiaData {
  id?: string;
  tipo: 'ordinaria' | 'extraordinaria';
  titulo: string;
  descricao: string;
  dataAssembleia: Date;
  local: string;
  pauta: string;
  quorumMinimo: number; // percentagem
  status: 'convocada' | 'em_andamento' | 'concluida' | 'cancelada';
  condominioId: string;
  ataUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VotacaoData {
  id?: string;
  assembleiaId: string;
  titulo: string;
  descricao: string;
  tipoVotacao: 'simples' | 'multipla_escolha' | 'classificacao';
  opcoes: any[]; // Array de opções para votação
  dataInicio: Date;
  dataFim: Date;
  resultado?: any; // Resultado da votação
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VotoData {
  id?: string;
  votacaoId: string;
  userId: string;
  voto: any; // Valor do voto
  createdAt?: Date;
}

export class AssembleiaModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: AssembleiaData): Promise<AssembleiaData> {
    const assembleia = await this.prisma.assembleiaConvocacao.create({
      data: {
        tipo: this.mapTipoToPrisma(data.tipo),
        titulo: data.titulo,
        descricao: data.descricao,
        data_assembleia: data.dataAssembleia,
        local: data.local,
        pauta: data.pauta,
        quorum_minimo: data.quorumMinimo,
        status: this.mapStatusToPrisma(data.status),
        condominio_id: data.condominioId,
        ata_url: data.ataUrl,
      },
    });
    return this.mapPrismaToInterface(assembleia);
  }

  async findById(id: string): Promise<AssembleiaData | null> {
    const assembleia = await this.prisma.assembleiaConvocacao.findUnique({
      where: { id },
    });
    return assembleia ? this.mapPrismaToInterface(assembleia) : null;
  }

  async findAll(condominiumId: string, filters?: any): Promise<AssembleiaData[]> {
    const assembleias = await this.prisma.assembleiaConvocacao.findMany({
      where: {
        condominio_id: condominiumId,
        ...filters,
      },
      orderBy: {
        data_assembleia: 'desc',
      },
    });
    return assembleias.map(assembleia => this.mapPrismaToInterface(assembleia));
  }

  async update(id: string, data: Partial<AssembleiaData>): Promise<AssembleiaData> {
    const updatedAssembleia = await this.prisma.assembleiaConvocacao.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedAssembleia);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.assembleiaConvocacao.delete({
      where: { id },
    });
  }

  async changeStatus(id: string, status: string): Promise<AssembleiaData> {
    const updatedAssembleia = await this.prisma.assembleiaConvocacao.update({
      where: { id },
      data: {
        status: this.mapStatusToPrisma(status as any),
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedAssembleia);
  }

  async getAssembleiasByStatus(condominiumId: string, status: string): Promise<AssembleiaData[]> {
    const assembleias = await this.prisma.assembleiaConvocacao.findMany({
      where: {
        condominio_id: condominiumId,
        status: this.mapStatusToPrisma(status as any),
      },
      orderBy: {
        data_assembleia: 'desc',
      },
    });
    return assembleias.map(assembleia => this.mapPrismaToInterface(assembleia));
  }

  async getAssembleiasByDateRange(condominiumId: string, startDate: Date, endDate: Date): Promise<AssembleiaData[]> {
    const assembleias = await this.prisma.assembleiaConvocacao.findMany({
      where: {
        condominio_id: condominiumId,
        data_assembleia: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        data_assembleia: 'desc',
      },
    });
    return assembleias.map(assembleia => this.mapPrismaToInterface(assembleia));
  }

  private mapPrismaToInterface(prismaAssembleia: PrismaAssembleia): AssembleiaData {
    return {
      id: prismaAssembleia.id,
      tipo: this.mapTipoFromPrisma(prismaAssembleia.tipo),
      titulo: prismaAssembleia.titulo,
      descricao: prismaAssembleia.descricao,
      dataAssembleia: prismaAssembleia.data_assembleia,
      local: prismaAssembleia.local,
      pauta: prismaAssembleia.pauta,
      quorumMinimo: prismaAssembleia.quorum_minimo,
      status: this.mapStatusFromPrisma(prismaAssembleia.status),
      condominioId: prismaAssembleia.condominio_id,
      ataUrl: prismaAssembleia.ata_url || undefined,
      createdAt: prismaAssembleia.created_at,
      updatedAt: prismaAssembleia.updated_at,
    };
  }

  private mapTipoToPrisma(tipo: string): string {
    switch(tipo) {
      case 'ordinaria': return 'ORDINARIA';
      case 'extraordinaria': return 'EXTRAORDINARIA';
      default: return 'ORDINARIA';
    }
  }

  private mapTipoFromPrisma(tipo: string): 'ordinaria' | 'extraordinaria' {
    switch(tipo) {
      case 'ORDINARIA': return 'ordinaria';
      case 'EXTRAORDINARIA': return 'extraordinaria';
      default: return 'ordinaria';
    }
  }

  private mapStatusToPrisma(status: string): string {
    switch(status) {
      case 'convocada': return 'CONVOCADA';
      case 'em_andamento': return 'EM_ANDAMENTO';
      case 'concluida': return 'CONCLUIDA';
      case 'cancelada': return 'CANCELADA';
      default: return 'CONVOCADA';
    }
  }

  private mapStatusFromPrisma(status: string): 'convocada' | 'em_andamento' | 'concluida' | 'cancelada' {
    switch(status) {
      case 'CONVOCADA': return 'convocada';
      case 'EM_ANDAMENTO': return 'em_andamento';
      case 'CONCLUIDA': return 'concluida';
      case 'CANCELADA': return 'cancelada';
      default: return 'convocada';
    }
  }
}

export class VotacaoModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: VotacaoData): Promise<VotacaoData> {
    const votacao = await this.prisma.assembleiaVotacao.create({
      data: {
        assembleia_id: data.assembleiaId,
        titulo: data.titulo,
        descricao: data.descricao,
        tipo_votacao: this.mapTipoVotacaoToPrisma(data.tipoVotacao),
        opcoes: data.opcoes,
        data_inicio: data.dataInicio,
        data_fim: data.dataFim,
        resultado: data.resultado,
      },
    });
    return this.mapPrismaToInterface(votacao);
  }

  async findById(id: string): Promise<VotacaoData | null> {
    const votacao = await this.prisma.assembleiaVotacao.findUnique({
      where: { id },
    });
    return votacao ? this.mapPrismaToInterface(votacao) : null;
  }

  async findByAssembleiaId(assembleiaId: string): Promise<VotacaoData[]> {
    const votacoes = await this.prisma.assembleiaVotacao.findMany({
      where: {
        assembleia_id: assembleiaId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return votacoes.map(votacao => this.mapPrismaToInterface(votacao));
  }

  async update(id: string, data: Partial<VotacaoData>): Promise<VotacaoData> {
    const updatedVotacao = await this.prisma.assembleiaVotacao.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedVotacao);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.assembleiaVotacao.delete({
      where: { id },
    });
  }

  private mapPrismaToInterface(prismaVotacao: PrismaVotacao): VotacaoData {
    return {
      id: prismaVotacao.id,
      assembleiaId: prismaVotacao.assembleia_id,
      titulo: prismaVotacao.titulo,
      descricao: prismaVotacao.descricao,
      tipoVotacao: this.mapTipoVotacaoFromPrisma(prismaVotacao.tipo_votacao),
      opcoes: prismaVotacao.opcoes as any[],
      dataInicio: prismaVotacao.data_inicio,
      dataFim: prismaVotacao.data_fim,
      resultado: prismaVotacao.resultado as any,
      createdAt: prismaVotacao.created_at,
      updatedAt: prismaVotacao.updated_at,
    };
  }

  private mapTipoVotacaoToPrisma(tipoVotacao: string): string {
    switch(tipoVotacao) {
      case 'simples': return 'SIMPLES';
      case 'multipla_escolha': return 'MULTIPLA_ESCOLHA';
      case 'classificacao': return 'CLASSIFICACAO';
      default: return 'SIMPLES';
    }
  }

  private mapTipoVotacaoFromPrisma(tipoVotacao: string): 'simples' | 'multipla_escolha' | 'classificacao' {
    switch(tipoVotacao) {
      case 'SIMPLES': return 'simples';
      case 'MULTIPLA_ESCOLHA': return 'multipla_escolha';
      case 'CLASSIFICACAO': return 'classificacao';
      default: return 'simples';
    }
  }
}

export class VotoModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: VotoData): Promise<VotoData> {
    const voto = await this.prisma.voto.create({
      data: {
        votacao_id: data.votacaoId,
        user_id: data.userId,
        voto: data.voto,
      },
    });
    return this.mapPrismaToInterface(voto);
  }

  async findByVotacaoAndUser(votacaoId: string, userId: string): Promise<VotoData | null> {
    const voto = await this.prisma.voto.findUnique({
      where: {
        votacao_id_user_id: {
          votacao_id: votacaoId,
          user_id: userId,
        },
      },
    });
    return voto ? this.mapPrismaToInterface(voto) : null;
  }

  async getVotosByVotacao(votacaoId: string): Promise<VotoData[]> {
    const votos = await this.prisma.voto.findMany({
      where: {
        votacao_id: votacaoId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return votos.map(voto => this.mapPrismaToInterface(voto));
  }

  private mapPrismaToInterface(prismaVoto: PrismaVoto): VotoData {
    return {
      id: prismaVoto.id,
      votacaoId: prismaVoto.votacao_id,
      userId: prismaVoto.user_id,
      voto: prismaVoto.voto as any,
      createdAt: prismaVoto.created_at,
    };
  }
}