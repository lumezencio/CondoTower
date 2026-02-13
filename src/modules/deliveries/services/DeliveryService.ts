import { EncomendaModel, EncomendaData } from './models/Delivery';

export interface DeliverySummary {
  total: number;
  awaitingPickup: number;
  delivered: number;
  byType: {
    correios: number;
    sedex: number;
    transportadora: number;
    entregador: number;
    outro: number;
  };
  pendingNotifications: number; // Encomendas que ainda não foram notificadas
}

export class DeliveryService {
  private encomendaModel: EncomendaModel;

  constructor() {
    this.encomendaModel = new EncomendaModel();
  }

  // Métodos para Encomendas
  async createEncomenda(data: EncomendaData): Promise<EncomendaData> {
    // Validação de dados
    this.validateEncomendaData(data);
    return await this.encomendaModel.create(data);
  }

  async getEncomendaById(id: string): Promise<EncomendaData | null> {
    return await this.encomendaModel.findById(id);
  }

  async getAllEncomendas(condominiumId: string, filters?: any): Promise<EncomendaData[]> {
    return await this.encomendaModel.findAll(condominiumId, filters);
  }

  async updateEncomenda(id: string, data: Partial<EncomendaData>): Promise<EncomendaData> {
    // Validação de dados se campos importantes forem atualizados
    if (data.remetente || data.tipo || data.apartamentoId || data.status) {
      const currentEncomenda = await this.encomendaModel.findById(id);
      if (currentEncomenda) {
        const updatedData = { ...currentEncomenda, ...data } as EncomendaData;
        this.validateEncomendaData(updatedData);
      }
    }
    return await this.encomendaModel.update(id, data);
  }

  async deleteEncomenda(id: string): Promise<void> {
    // Não permitir exclusão de encomendas já retiradas
    const encomenda = await this.encomendaModel.findById(id);
    if (!encomenda) {
      throw new Error('Encomenda não encontrada');
    }
    
    if (encomenda.status === 'retirada' || encomenda.status === 'entregue') {
      throw new Error('Não é possível excluir uma encomenda que já foi retirada');
    }
    
    await this.encomendaModel.delete(id);
  }

  async markEncomendaAsRetirada(id: string, retiradoPor: string): Promise<EncomendaData> {
    const encomenda = await this.encomendaModel.findById(id);
    if (!encomenda) {
      throw new Error('Encomenda não encontrada');
    }
    
    if (encomenda.status === 'retirada' || encomenda.status === 'entregue') {
      throw new Error('Esta encomenda já foi retirada');
    }
    
    if (!retiradoPor || retiradoPor.trim().length === 0) {
      throw new Error('É necessário informar quem retirou a encomenda');
    }
    
    return await this.encomendaModel.markAsRetirada(id, retiradoPor);
  }

  async getEncomendasAguardandoRetirada(condominiumId: string): Promise<EncomendaData[]> {
    return await this.encomendaModel.getEncomendasAguardandoRetirada(condominiumId);
  }

  async getEncomendasByApartment(apartamentoId: string): Promise<EncomendaData[]> {
    return await this.encomendaModel.findAll('', { apartamento_id: apartamentoId });
  }

  async getEncomendasByType(condominiumId: string, tipo: string): Promise<EncomendaData[]> {
    return await this.encomendaModel.findAll(condominiumId, { tipo: this.mapTipoToPrisma(tipo) });
  }

  // Método para obter resumo de encomendas
  async getDeliverySummary(condominiumId: string): Promise<DeliverySummary> {
    const encomendas = await this.getAllEncomendas(condominiumId);
    
    const total = encomendas.length;
    const awaitingPickup = encomendas.filter(e => e.status === 'aguardando_retirada').length;
    const delivered = encomendas.filter(e => e.status === 'retirada' || e.status === 'entregue').length;
    
    const byType = {
      correios: encomendas.filter(e => e.tipo === 'correios').length,
      sedex: encomendas.filter(e => e.tipo === 'sedex').length,
      transportadora: encomendas.filter(e => e.tipo === 'transportadora').length,
      entregador: encomendas.filter(e => e.tipo === 'entregador').length,
      outro: encomendas.filter(e => e.tipo === 'outro').length,
    };

    // Contar encomendas que ainda não foram retiradas e têm mais de 3 dias
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const pendingNotifications = encomendas.filter(e => 
      e.status === 'aguardando_retirada' && e.dataRecebimento < threeDaysAgo
    ).length;

    return {
      total,
      awaitingPickup,
      delivered,
      byType,
      pendingNotifications,
    };
  }

  // Validações
  private validateEncomendaData(data: EncomendaData): void {
    if (!data.tipo) {
      throw new Error('Tipo de encomenda é obrigatório');
    }

    const validTypes: (EncomendaData['tipo'])[] = ['correios', 'sedex', 'transportadora', 'entregador', 'outro'];
    if (!validTypes.includes(data.tipo)) {
      throw new Error(`Tipo inválido. Os tipos válidos são: ${validTypes.join(', ')}`);
    }

    if (!data.remetente || data.remetente.trim().length === 0) {
      throw new Error('Remetente é obrigatório');
    }

    if (data.remetente.trim().length > 100) {
      throw new Error('Remetente não pode ter mais de 100 caracteres');
    }

    if (!data.condominioId) {
      throw new Error('Condomínio é obrigatório');
    }

    if (!data.apartamentoId) {
      throw new Error('Apartamento é obrigatório');
    }

    if (!data.dataRecebimento) {
      throw new Error('Data de recebimento é obrigatória');
    }

    if (data.dataRecebimento > new Date()) {
      throw new Error('Data de recebimento não pode ser futura');
    }

    if (data.descricao && data.descricao.length > 500) {
      throw new Error('Descrição não pode ter mais de 500 caracteres');
    }

    if (data.observacoes && data.observacoes.length > 500) {
      throw new Error('Observações não podem ter mais de 500 caracteres');
    }

    if (!data.status) {
      throw new Error('Status é obrigatório');
    }

    const validStatus: (EncomendaData['status'])[] = ['aguardando_retirada', 'retirada', 'entregue'];
    if (!validStatus.includes(data.status)) {
      throw new Error(`Status inválido. Os status válidos são: ${validStatus.join(', ')}`);
    }

    // Regras de negócio específicas
    if (data.status === 'retirada' && !data.dataRetirada) {
      throw new Error('Para status "retirada", a data de retirada é obrigatória');
    }

    if (data.status === 'retirada' && !data.retiradoPor) {
      throw new Error('Para status "retirada", é necessário informar quem retirou');
    }

    // Validar se a data de retirada é posterior à data de recebimento
    if (data.dataRetirada && data.dataRecebimento && data.dataRetirada < data.dataRecebimento) {
      throw new Error('Data de retirada não pode ser anterior à data de recebimento');
    }
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
}