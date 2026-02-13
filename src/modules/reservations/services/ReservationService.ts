import { AreaComumModel, ReservaModel, AreaComumData, ReservaData } from './models/Reservation';

export interface ReservationSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byArea: Record<string, number>;
  upcoming: number; // Reservas nos próximos 7 dias
}

export class ReservationService {
  private areaComumModel: AreaComumModel;
  private reservaModel: ReservaModel;

  constructor() {
    this.areaComumModel = new AreaComumModel();
    this.reservaModel = new ReservaModel();
  }

  // Métodos para Áreas Comuns
  async createAreaComum(data: AreaComumData): Promise<AreaComumData> {
    // Validação de dados
    this.validateAreaComumData(data);
    return await this.areaComumModel.create(data);
  }

  async getAreaComumById(id: string): Promise<AreaComumData | null> {
    return await this.areaComumModel.findById(id);
  }

  async getAllAreasComuns(condominiumId: string, filters?: any): Promise<AreaComumData[]> {
    return await this.areaComumModel.findAll(condominiumId, filters);
  }

  async updateAreaComum(id: string, data: Partial<AreaComumData>): Promise<AreaComumData> {
    // Validação de dados se campos importantes forem atualizados
    if (data.nome || data.descricao || data.capacidade || data.valorReserva || data.tempoMinReserva || data.tempoMaxReserva) {
      const currentArea = await this.areaComumModel.findById(id);
      if (currentArea) {
        const updatedData = { ...currentArea, ...data } as AreaComumData;
        this.validateAreaComumData(updatedData);
      }
    }
    return await this.areaComumModel.update(id, data);
  }

  async deleteAreaComum(id: string): Promise<void> {
    // Verificar se há reservas pendentes para esta área antes de excluir
    const pendingReservations = await this.reservaModel.findAll({
      area_comum_id: id,
      status: 'pendente'
    });
    
    if (pendingReservations.length > 0) {
      throw new Error('Não é possível excluir uma área comum que tem reservas pendentes');
    }
    
    await this.areaComumModel.delete(id);
  }

  // Métodos para Reservas
  async createReserva(data: ReservaData): Promise<ReservaData> {
    // Validação de dados
    this.validateReservaData(data);
    
    // Verificar conflitos de agenda
    await this.checkScheduleConflict(data.areaComumId, data.dataInicio, data.dataFim);
    
    // Verificar se a área comum está ativa
    const area = await this.areaComumModel.findById(data.areaComumId);
    if (!area || !area.ativo) {
      throw new Error('A área comum selecionada não está disponível para reservas');
    }
    
    return await this.reservaModel.create(data);
  }

  async getReservaById(id: string): Promise<ReservaData | null> {
    return await this.reservaModel.findById(id);
  }

  async getAllReservas(filters?: any): Promise<ReservaData[]> {
    return await this.reservaModel.findAll(filters);
  }

  async getReservasByAreaAndDate(areaComumId: string, data: Date): Promise<ReservaData[]> {
    return await this.reservaModel.findByAreaAndDate(areaComumId, data);
  }

  async updateReserva(id: string, data: Partial<ReservaData>): Promise<ReservaData> {
    // Não permitir atualização de reservas já concluídas ou canceladas
    const currentReserva = await this.reservaModel.findById(id);
    if (!currentReserva) {
      throw new Error('Reserva não encontrada');
    }
    
    if (currentReserva.status === 'concluida' || currentReserva.status === 'cancelada') {
      throw new Error('Não é possível atualizar uma reserva já concluída ou cancelada');
    }
    
    // Validação de dados se campos importantes forem atualizados
    if (data.dataInicio || data.dataFim || data.areaComumId) {
      const updatedData = { ...currentReserva, ...data } as ReservaData;
      this.validateReservaData(updatedData);
      
      // Verificar conflitos de agenda
      await this.checkScheduleConflict(updatedData.areaComumId, updatedData.dataInicio, updatedData.dataFim, id);
    }
    
    return await this.reservaModel.update(id, data);
  }

  async deleteReserva(id: string): Promise<void> {
    const reserva = await this.reservaModel.findById(id);
    if (!reserva) {
      throw new Error('Reserva não encontrada');
    }
    
    // Só permite exclusão se a reserva ainda não tiver sido iniciada
    if (reserva.dataInicio < new Date()) {
      throw new Error('Não é possível excluir uma reserva que já começou');
    }
    
    await this.reservaModel.delete(id);
  }

  async changeReservaStatus(id: string, status: string, motivoRejeicao?: string): Promise<ReservaData> {
    const reserva = await this.reservaModel.findById(id);
    if (!reserva) {
      throw new Error('Reserva não encontrada');
    }
    
    // Validar transição de status
    this.validateStatusTransition(reserva.status, status);
    
    // Se estiver rejeitando, motivo é obrigatório
    if (status === 'rejeitada' && !motivoRejeicao) {
      throw new Error('Motivo de rejeição é obrigatório');
    }
    
    return await this.reservaModel.changeStatus(id, status, motivoRejeicao);
  }

  async getReservasByCondominium(condominiumId: string): Promise<ReservaData[]> {
    // Primeiro obtemos todas as áreas comuns do condomínio
    const areasComuns = await this.getAllAreasComuns(condominiumId);
    const areaIds = areasComuns.map(area => area.id!);
    
    // Depois obtemos todas as reservas dessas áreas
    if (areaIds.length === 0) return [];
    
    return await this.reservaModel.findAll({
      area_comum_id: {
        in: areaIds
      }
    });
  }

  async getReservasByApartamento(apartamentoId: string): Promise<ReservaData[]> {
    return await this.reservaModel.findAll({
      apartamento_id: apartamentoId
    });
  }

  async getReservasPendingApproval(condominiumId: string): Promise<ReservaData[]> {
    const areasComuns = await this.getAllAreasComuns(condominiumId);
    const areaIds = areasComuns.map(area => area.id!);
    
    if (areaIds.length === 0) return [];
    
    return await this.reservaModel.findAll({
      area_comum_id: {
        in: areaIds
      },
      status: 'pendente'
    });
  }

  // Método para obter resumo de reservas
  async getReservationSummary(condominiumId: string): Promise<ReservationSummary> {
    const reservas = await this.getReservasByCondominium(condominiumId);
    
    const total = reservas.length;
    const pending = reservas.filter(r => r.status === 'pendente').length;
    const approved = reservas.filter(r => r.status === 'aprovada').length;
    const rejected = reservas.filter(r => r.status === 'rejeitada').length;
    
    // Contar por área
    const byArea: Record<string, number> = {};
    for (const reserva of reservas) {
      const area = await this.areaComumModel.findById(reserva.areaComumId);
      const areaName = area?.nome || reserva.areaComumId;
      byArea[areaName] = (byArea[areaName] || 0) + 1;
    }
    
    // Contar reservas nos próximos 7 dias
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const upcoming = reservas.filter(r => 
      r.dataInicio <= sevenDaysFromNow && r.status !== 'concluida' && r.status !== 'cancelada'
    ).length;

    return {
      total,
      pending,
      approved,
      rejected,
      byArea,
      upcoming,
    };
  }

  // Validações
  private validateAreaComumData(data: AreaComumData): void {
    if (!data.nome || data.nome.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }

    if (data.nome.trim().length > 100) {
      throw new Error('Nome não pode ter mais de 100 caracteres');
    }

    if (data.descricao && data.descricao.length > 500) {
      throw new Error('Descrição não pode ter mais de 500 caracteres');
    }

    if (data.capacidade !== undefined && data.capacidade <= 0) {
      throw new Error('Capacidade deve ser maior que zero');
    }

    if (data.valorReserva !== undefined && data.valorReserva < 0) {
      throw new Error('Valor da reserva não pode ser negativo');
    }

    if (data.tempoMinReserva <= 0) {
      throw new Error('Tempo mínimo de reserva deve ser maior que zero');
    }

    if (data.tempoMaxReserva < data.tempoMinReserva) {
      throw new Error('Tempo máximo deve ser maior ou igual ao tempo mínimo');
    }

    if (data.antecedenciaMin < 0) {
      throw new Error('Antecedência mínima não pode ser negativa');
    }

    if (data.antecedenciaMax < data.antecedenciaMin) {
      throw new Error('Antecedência máxima deve ser maior ou igual à mínima');
    }

    if (!data.condominioId) {
      throw new Error('Condomínio é obrigatório');
    }
  }

  private validateReservaData(data: ReservaData): void {
    if (!data.areaComumId) {
      throw new Error('Área comum é obrigatória');
    }

    if (!data.apartamentoId) {
      throw new Error('Apartamento é obrigatório');
    }

    if (!data.dataInicio) {
      throw new Error('Data de início é obrigatória');
    }

    if (!data.dataFim) {
      throw new Error('Data de término é obrigatória');
    }

    if (data.dataInicio >= data.dataFim) {
      throw new Error('Data de término deve ser posterior à data de início');
    }

    if (data.dataInicio < new Date()) {
      throw new Error('Data de início não pode ser no passado');
    }

    if (data.valor !== undefined && data.valor < 0) {
      throw new Error('Valor não pode ser negativo');
    }

    if (data.observacoes && data.observacoes.length > 500) {
      throw new Error('Observações não podem ter mais de 500 caracteres');
    }

    // Verificar se a duração está dentro dos limites da área
    const area = this.areaComumModel.findById(data.areaComumId);
    if (area) {
      const durationMinutes = (data.dataFim.getTime() - data.dataInicio.getTime()) / (1000 * 60);
      
      if (durationMinutes < area.tempoMinReserva) {
        throw new Error(`Duração mínima é de ${area.tempoMinReserva} minutos`);
      }
      
      if (durationMinutes > area.tempoMaxReserva) {
        throw new Error(`Duração máxima é de ${area.tempoMaxReserva} minutos`);
      }
      
      // Verificar se a antecedência está dentro dos limites
      const hoursUntilStart = (data.dataInicio.getTime() - new Date().getTime()) / (1000 * 60 * 60);
      if (hoursUntilStart < area.antecedenciaMin) {
        throw new Error(`É necessário antecedência mínima de ${area.antecedenciaMin} horas`);
      }
      
      if (hoursUntilStart > area.antecedenciaMax) {
        throw new Error(`O agendamento deve ser feito dentro do período máximo de ${area.antecedenciaMax} horas`);
      }
    }
  }

  private async checkScheduleConflict(areaComumId: string, dataInicio: Date, dataFim: Date, excludeReservaId?: string): Promise<void> {
    // Obter reservas existentes para esta área no mesmo período
    const conflictingReservas = await this.reservaModel.findAll({
      area_comum_id: areaComumId,
      status: { in: ['pendente', 'aprovada'] },
      ...(excludeReservaId && { id: { not: excludeReservaId } })
    });

    const hasConflict = conflictingReservas.some(reserva => {
      // Verificar se há sobreposição de horários
      return (dataInicio < reserva.dataFim && dataFim > reserva.dataInicio);
    });

    if (hasConflict) {
      throw new Error('Já existe uma reserva para este horário');
    }
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      'pendente': ['aprovada', 'rejeitada', 'cancelada'],
      'aprovada': ['cancelada', 'concluida'],
      'rejeitada': ['pendente'],
      'cancelada': ['pendente'],
      'concluida': [] // Não permite mudanças após conclusão
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(`Transição de status de "${currentStatus}" para "${newStatus}" não é permitida`);
    }
  }
}