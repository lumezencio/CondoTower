import { PrismaClient, Reserva as PrismaReserva, AreaComum as PrismaAreaComum } from '@prisma/client';

export interface AreaComumData {
  id?: string;
  nome: string;
  descricao?: string;
  condominioId: string;
  capacidade?: number;
  valorReserva?: number;
  tempoMinReserva: number; // em minutos
  tempoMaxReserva: number; // em minutos
  antecedenciaMin: number; // em horas
  antecedenciaMax: number; // em horas
  requerAprovacao: boolean;
  ativo: boolean;
  regras?: string;
  fotos?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReservaData {
  id?: string;
  areaComumId: string;
  apartamentoId: string;
  dataInicio: Date;
  dataFim: Date;
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'cancelada' | 'concluida';
  valor?: number;
  observacoes?: string;
  motivoRejeicao?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AreaComumModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: AreaComumData): Promise<AreaComumData> {
    const areaComum = await this.prisma.areaComum.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        condominio_id: data.condominioId,
        capacidade: data.capacidade,
        valor_reserva: data.valorReserva,
        tempo_min_reserva: data.tempoMinReserva,
        tempo_max_reserva: data.tempoMaxReserva,
        antecedencia_min: data.antecedenciaMin,
        antecedencia_max: data.antecedenciaMax,
        requer_aprovacao: data.requerAprovacao,
        ativo: data.ativo,
        regras: data.regras,
        fotos: data.fotos || [],
      },
    });
    return this.mapPrismaToInterface(areaComum);
  }

  async findById(id: string): Promise<AreaComumData | null> {
    const areaComum = await this.prisma.areaComum.findUnique({
      where: { id },
    });
    return areaComum ? this.mapPrismaToInterface(areaComum) : null;
  }

  async findAll(condominiumId: string, filters?: any): Promise<AreaComumData[]> {
    const areasComuns = await this.prisma.areaComum.findMany({
      where: {
        condominio_id: condominiumId,
        ativo: true,
        ...filters,
      },
      orderBy: {
        nome: 'asc',
      },
    });
    return areasComuns.map(area => this.mapPrismaToInterface(area));
  }

  async update(id: string, data: Partial<AreaComumData>): Promise<AreaComumData> {
    const updatedArea = await this.prisma.areaComum.update({
      where: { id },
      data: {
        ...data,
        fotos: data.fotos || undefined,
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedArea);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.areaComum.delete({
      where: { id },
    });
  }

  private mapPrismaToInterface(prismaArea: PrismaAreaComum): AreaComumData {
    return {
      id: prismaArea.id,
      nome: prismaArea.nome,
      descricao: prismaArea.descricao || undefined,
      condominioId: prismaArea.condominio_id,
      capacidade: prismaArea.capacidade || undefined,
      valorReserva: prismaArea.valor_reserva || undefined,
      tempoMinReserva: prismaArea.tempo_min_reserva,
      tempoMaxReserva: prismaArea.tempo_max_reserva,
      antecedenciaMin: prismaArea.antecedencia_min,
      antecedenciaMax: prismaArea.antecedencia_max,
      requerAprovacao: prismaArea.requer_aprovacao,
      ativo: prismaArea.ativo,
      regras: prismaArea.regras || undefined,
      fotos: prismaArea.fotos as string[],
      createdAt: prismaArea.created_at,
      updatedAt: prismaArea.updated_at,
    };
  }
}

export class ReservaModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: ReservaData): Promise<ReservaData> {
    const reserva = await this.prisma.reserva.create({
      data: {
        area_comum_id: data.areaComumId,
        apartamento_id: data.apartamentoId,
        data_inicio: data.dataInicio,
        data_fim: data.dataFim,
        status: this.mapStatusToPrisma(data.status),
        valor: data.valor,
        observacoes: data.observacoes,
        motivo_rejeicao: data.motivoRejeicao,
      },
    });
    return this.mapPrismaToInterface(reserva);
  }

  async findById(id: string): Promise<ReservaData | null> {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id },
    });
    return reserva ? this.mapPrismaToInterface(reserva) : null;
  }

  async findAll(filters?: any): Promise<ReservaData[]> {
    const reservas = await this.prisma.reserva.findMany({
      where: {
        ...filters,
      },
      orderBy: {
        data_inicio: 'asc',
      },
    });
    return reservas.map(reserva => this.mapPrismaToInterface(reserva));
  }

  async findByAreaAndDate(areaComumId: string, data: Date): Promise<ReservaData[]> {
    const reservas = await this.prisma.reserva.findMany({
      where: {
        area_comum_id: areaComumId,
        status: { in: ['aprovada', 'pendente'] },
        OR: [
          {
            data_inicio: { lte: data },
            data_fim: { gte: data },
          },
          {
            data_inicio: { gte: data },
            data_inicio: { lt: new Date(data.getTime() + 24 * 60 * 60 * 1000) },
          },
        ],
      },
      orderBy: {
        data_inicio: 'asc',
      },
    });
    return reservas.map(reserva => this.mapPrismaToInterface(reserva));
  }

  async update(id: string, data: Partial<ReservaData>): Promise<ReservaData> {
    const updatedReserva = await this.prisma.reserva.update({
      where: { id },
      data: {
        ...data,
        status: data.status ? this.mapStatusToPrisma(data.status as any) : undefined,
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedReserva);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.reserva.delete({
      where: { id },
    });
  }

  async changeStatus(id: string, status: string, motivoRejeicao?: string): Promise<ReservaData> {
    const updatedReserva = await this.prisma.reserva.update({
      where: { id },
      data: {
        status: this.mapStatusToPrisma(status as any),
        motivo_rejeicao: motivoRejeicao,
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedReserva);
  }

  private mapPrismaToInterface(prismaReserva: PrismaReserva): ReservaData {
    return {
      id: prismaReserva.id,
      areaComumId: prismaReserva.area_comum_id,
      apartamentoId: prismaReserva.apartamento_id,
      dataInicio: prismaReserva.data_inicio,
      dataFim: prismaReserva.data_fim,
      status: this.mapStatusFromPrisma(prismaReserva.status),
      valor: prismaReserva.valor || undefined,
      observacoes: prismaReserva.observacoes || undefined,
      motivoRejeicao: prismaReserva.motivo_rejeicao || undefined,
      createdAt: prismaReserva.created_at,
      updatedAt: prismaReserva.updated_at,
    };
  }

  private mapStatusToPrisma(status: string): string {
    switch(status) {
      case 'pendente': return 'PENDENTE';
      case 'aprovada': return 'APROVADA';
      case 'rejeitada': return 'REJEITADA';
      case 'cancelada': return 'CANCELADA';
      case 'concluida': return 'CONCLUIDA';
      default: return 'PENDENTE';
    }
  }

  private mapStatusFromPrisma(status: string): 'pendente' | 'aprovada' | 'rejeitada' | 'cancelada' | 'concluida' {
    switch(status) {
      case 'PENDENTE': return 'pendente';
      case 'APROVADA': return 'aprovada';
      case 'REJEITADA': return 'rejeitada';
      case 'CANCELADA': return 'cancelada';
      case 'CONCLUIDA': return 'concluida';
      default: return 'pendente';
    }
  }
}