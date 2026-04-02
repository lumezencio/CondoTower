import { AssembleiaModel, VotacaoModel, VotoModel, AssembleiaData, VotacaoData, VotoData } from './models/Meeting';

export interface MeetingSummary {
  total: number;
  byStatus: {
    convocada: number;
    em_andamento: number;
    concluida: number;
    cancelada: number;
  };
  byType: {
    ordinaria: number;
    extraordinaria: number;
  };
  upcoming: number; // Assembleias nos próximos 30 dias
}

export class MeetingService {
  private assembleiaModel: AssembleiaModel;
  private votacaoModel: VotacaoModel;
  private votoModel: VotoModel;

  constructor() {
    this.assembleiaModel = new AssembleiaModel();
    this.votacaoModel = new VotacaoModel();
    this.votoModel = new VotoModel();
  }

  // Métodos para Assembleias
  async createAssembleia(data: AssembleiaData): Promise<AssembleiaData> {
    // Validação de dados
    this.validateAssembleiaData(data);
    return await this.assembleiaModel.create(data);
  }

  async getAssembleiaById(id: string): Promise<AssembleiaData | null> {
    return await this.assembleiaModel.findById(id);
  }

  async getAllAssembleias(condominiumId: string, filters?: any): Promise<AssembleiaData[]> {
    return await this.assembleiaModel.findAll(condominiumId, filters);
  }

  async updateAssembleia(id: string, data: Partial<AssembleiaData>): Promise<AssembleiaData> {
    // Validação de dados se campos importantes forem atualizados
    if (data.titulo || data.descricao || data.dataAssembleia || data.local || data.pauta) {
      const currentAssembleia = await this.assembleiaModel.findById(id);
      if (currentAssembleia) {
        const updatedData = { ...currentAssembleia, ...data } as AssembleiaData;
        this.validateAssembleiaData(updatedData);
      }
    }
    return await this.assembleiaModel.update(id, data);
  }

  async deleteAssembleia(id: string): Promise<void> {
    // Não permitir exclusão de assembleias que já estão em andamento ou concluídas
    const assembleia = await this.assembleiaModel.findById(id);
    if (!assembleia) {
      throw new Error('Assembleia não encontrada');
    }
    
    if (assembleia.status === 'em_andamento' || assembleia.status === 'concluida') {
      throw new Error('Não é possível excluir uma assembleia que já está em andamento ou concluída');
    }
    
    await this.assembleiaModel.delete(id);
  }

  async changeAssembleiaStatus(id: string, status: string): Promise<AssembleiaData> {
    const assembleia = await this.assembleiaModel.findById(id);
    if (!assembleia) {
      throw new Error('Assembleia não encontrada');
    }
    
    // Validar transição de status
    this.validateStatusTransition(assembleia.status, status);
    
    return await this.assembleiaModel.changeStatus(id, status);
  }

  async getAssembleiasByStatus(condominiumId: string, status: string): Promise<AssembleiaData[]> {
    return await this.assembleiaModel.getAssembleiasByStatus(condominiumId, status);
  }

  async getAssembleiasByDateRange(condominiumId: string, startDate: Date, endDate: Date): Promise<AssembleiaData[]> {
    return await this.assembleiaModel.getAssembleiasByDateRange(condominiumId, startDate, endDate);
  }

  // Métodos para Votações
  async createVotacao(data: VotacaoData): Promise<VotacaoData> {
    // Validação de dados
    this.validateVotacaoData(data);
    return await this.votacaoModel.create(data);
  }

  async getVotacaoById(id: string): Promise<VotacaoData | null> {
    return await this.votacaoModel.findById(id);
  }

  async getVotacoesByAssembleia(assembleiaId: string): Promise<VotacaoData[]> {
    return await this.votacaoModel.findByAssembleiaId(assembleiaId);
  }

  async updateVotacao(id: string, data: Partial<VotacaoData>): Promise<VotacaoData> {
    // Validação de dados se campos importantes forem atualizados
    if (data.titulo || data.descricao || data.tipoVotacao || data.opcoes) {
      const currentVotacao = await this.votacaoModel.findById(id);
      if (currentVotacao) {
        const updatedData = { ...currentVotacao, ...data } as VotacaoData;
        this.validateVotacaoData(updatedData);
      }
    }
    return await this.votacaoModel.update(id, data);
  }

  async deleteVotacao(id: string): Promise<void> {
    // Não permitir exclusão de votações que já possuem votos
    const votos = await this.votoModel.getVotosByVotacao(id);
    if (votos.length > 0) {
      throw new Error('Não é possível excluir uma votação que já possui votos registrados');
    }
    
    await this.votacaoModel.delete(id);
  }

  // Métodos para Votos
  async createVoto(data: VotoData): Promise<VotoData> {
    // Validação de dados
    this.validateVotoData(data);
    
    // Verificar se a votação ainda está aberta
    const votacao = await this.votacaoModel.findById(data.votacaoId);
    if (!votacao) {
      throw new Error('Votação não encontrada');
    }
    
    const now = new Date();
    if (now < votacao.dataInicio || now > votacao.dataFim) {
      throw new Error('Votação não está aberta para votação');
    }
    
    return await this.votoModel.create(data);
  }

  async getVotoByUserAndVotacao(votacaoId: string, userId: string): Promise<VotoData | null> {
    return await this.votoModel.findByVotacaoAndUser(votacaoId, userId);
  }

  async getVotosByVotacao(votacaoId: string): Promise<VotoData[]> {
    return await this.votoModel.getVotosByVotacao(votacaoId);
  }

  // Método para obter resumo de assembleias
  async getMeetingSummary(condominiumId: string): Promise<MeetingSummary> {
    const assembleias = await this.getAllAssembleias(condominiumId);
    
    const total = assembleias.length;
    
    const byStatus = {
      convocada: assembleias.filter(a => a.status === 'convocada').length,
      em_andamento: assembleias.filter(a => a.status === 'em_andamento').length,
      concluida: assembleias.filter(a => a.status === 'concluida').length,
      cancelada: assembleias.filter(a => a.status === 'cancelada').length,
    };
    
    const byType = {
      ordinaria: assembleias.filter(a => a.tipo === 'ordinaria').length,
      extraordinaria: assembleias.filter(a => a.tipo === 'extraordinaria').length,
    };

    // Contar assembleias nos próximos 30 dias
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const upcoming = assembleias.filter(a => 
      a.dataAssembleia <= thirtyDaysFromNow && a.status !== 'concluida' && a.status !== 'cancelada'
    ).length;

    return {
      total,
      byStatus,
      byType,
      upcoming,
    };
  }

  // Validações
  private validateAssembleiaData(data: AssembleiaData): void {
    if (!data.titulo || data.titulo.trim().length === 0) {
      throw new Error('Título é obrigatório');
    }

    if (data.titulo.trim().length > 200) {
      throw new Error('Título não pode ter mais de 200 caracteres');
    }

    if (!data.descricao || data.descricao.trim().length === 0) {
      throw new Error('Descrição é obrigatória');
    }

    if (data.descricao.trim().length < 10) {
      throw new Error('Descrição deve ter pelo menos 10 caracteres');
    }

    if (data.descricao.trim().length > 1000) {
      throw new Error('Descrição não pode ter mais de 1000 caracteres');
    }

    if (!data.local || data.local.trim().length === 0) {
      throw new Error('Local é obrigatório');
    }

    if (data.local.trim().length > 100) {
      throw new Error('Local não pode ter mais de 100 caracteres');
    }

    if (!data.pauta || data.pauta.trim().length === 0) {
      throw new Error('Pauta é obrigatória');
    }

    if (data.pauta.trim().length < 10) {
      throw new Error('Pauta deve ter pelo menos 10 caracteres');
    }

    if (data.pauta.trim().length > 2000) {
      throw new Error('Pauta não pode ter mais de 2000 caracteres');
    }

    if (data.quorumMinimo < 0 || data.quorumMinimo > 100) {
      throw new Error('Quórum mínimo deve estar entre 0 e 100');
    }

    if (!data.dataAssembleia) {
      throw new Error('Data da assembleia é obrigatória');
    }

    if (data.dataAssembleia < new Date()) {
      throw new Error('Data da assembleia não pode ser no passado');
    }

    if (!data.tipo) {
      throw new Error('Tipo é obrigatório');
    }

    const validTypes: (AssembleiaData['tipo'])[] = ['ordinaria', 'extraordinaria'];
    if (!validTypes.includes(data.tipo)) {
      throw new Error(`Tipo inválido. Os tipos válidos são: ${validTypes.join(', ')}`);
    }

    if (!data.status) {
      throw new Error('Status é obrigatório');
    }

    const validStatus: (AssembleiaData['status'])[] = ['convocada', 'em_andamento', 'concluida', 'cancelada'];
    if (!validStatus.includes(data.status)) {
      throw new Error(`Status inválido. Os status válidos são: ${validStatus.join(', ')}`);
    }

    if (!data.condominioId) {
      throw new Error('Condomínio é obrigatório');
    }

    // Validar URL da ATA se fornecida
    if (data.ataUrl) {
      try {
        new URL(data.ataUrl);
      } catch (e) {
        throw new Error('URL da ATA inválida');
      }
    }

    // Regras de negócio específicas
    if (data.tipo === 'extraordinaria' && data.quorumMinimo < 25) {
      throw new Error('Assembleias extraordinárias exigem quórum mínimo de 25%');
    }
  }

  private validateVotacaoData(data: VotacaoData): void {
    if (!data.titulo || data.titulo.trim().length === 0) {
      throw new Error('Título é obrigatório');
    }

    if (data.titulo.trim().length > 200) {
      throw new Error('Título não pode ter mais de 200 caracteres');
    }

    if (!data.descricao || data.descricao.trim().length === 0) {
      throw new Error('Descrição é obrigatória');
    }

    if (data.descricao.trim().length < 10) {
      throw new Error('Descrição deve ter pelo menos 10 caracteres');
    }

    if (data.descricao.trim().length > 1000) {
      throw new Error('Descrição não pode ter mais de 1000 caracteres');
    }

    if (!data.tipoVotacao) {
      throw new Error('Tipo de votação é obrigatório');
    }

    const validTypes: (VotacaoData['tipoVotacao'])[] = ['simples', 'multipla_escolha', 'classificacao'];
    if (!validTypes.includes(data.tipoVotacao)) {
      throw new Error(`Tipo de votação inválido. Os tipos válidos são: ${validTypes.join(', ')}`);
    }

    if (!data.opcoes || data.opcoes.length === 0) {
      throw new Error('Opções de votação são obrigatórias');
    }

    if (data.opcoes.length < 2) {
      throw new Error('Deve haver pelo menos 2 opções de votação');
    }

    if (!data.dataInicio) {
      throw new Error('Data de início é obrigatória');
    }

    if (!data.dataFim) {
      throw new Error('Data de fim é obrigatória');
    }

    if (data.dataInicio >= data.dataFim) {
      throw new Error('Data de fim deve ser posterior à data de início');
    }

    if (data.dataInicio < new Date()) {
      throw new Error('Data de início não pode ser no passado');
    }

    if (!data.assembleiaId) {
      throw new Error('Assembleia é obrigatória');
    }
  }

  private validateVotoData(data: VotoData): void {
    if (!data.votacaoId) {
      throw new Error('Votação é obrigatória');
    }

    if (!data.userId) {
      throw new Error('Usuário é obrigatório');
    }

    if (data.voto === undefined || data.voto === null) {
      throw new Error('Voto é obrigatório');
    }
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      'convocada': ['em_andamento', 'cancelada'],
      'em_andamento': ['concluida', 'cancelada'],
      'concluida': [], // Não permite mudanças após conclusão
      'cancelada': ['convocada'] // Permitir reativação
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(`Transição de status de "${currentStatus}" para "${newStatus}" não é permitida`);
    }
  }
}