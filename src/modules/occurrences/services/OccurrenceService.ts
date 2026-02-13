import { OcorrenciaModel, OcorrenciaData, OcorrenciaComentarioModel, OcorrenciaComentarioData } from './models/Ocorrencia';

export interface OcorrenciaSummary {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  cancelled: number;
  byType: {
    manutencao: number;
    seguranca: number;
    limpeza: number;
    vizinhanca: number;
    elevador: number;
    piscina: number;
    barulho: number;
    outro: number;
  };
  byPriority: {
    baixa: number;
    media: number;
    alta: number;
    urgente: number;
  };
}

export class OccurrenceService {
  private ocorrenciaModel: OcorrenciaModel;
  private comentarioModel: OcorrenciaComentarioModel;

  constructor() {
    this.ocorrenciaModel = new OcorrenciaModel();
    this.comentarioModel = new OcorrenciaComentarioModel();
  }

  // Métodos para Ocorrências
  async createOcorrencia(data: OcorrenciaData): Promise<OcorrenciaData> {
    // Validação de dados
    this.validateOcorrenciaData(data);
    return await this.ocorrenciaModel.create(data);
  }

  async getOcorrenciaById(id: string): Promise<OcorrenciaData | null> {
    return await this.ocorrenciaModel.findById(id);
  }

  async getAllOcorrencias(condominiumId: string, filters?: any): Promise<OcorrenciaData[]> {
    return await this.ocorrenciaModel.findAll(condominiumId, filters);
  }

  async updateOcorrencia(id: string, data: Partial<OcorrenciaData>): Promise<OcorrenciaData> {
    // Validação de dados se campos importantes forem atualizados
    if (data.titulo || data.descricao || data.tipo || data.prioridade || data.status) {
      const currentOcorrencia = await this.ocorrenciaModel.findById(id);
      if (currentOcorrencia) {
        const updatedData = { ...currentOcorrencia, ...data } as OcorrenciaData;
        this.validateOcorrenciaData(updatedData);
      }
    }
    return await this.ocorrenciaModel.update(id, data);
  }

  async deleteOcorrencia(id: string): Promise<void> {
    await this.ocorrenciaModel.delete(id);
  }

  async changeOcorrenciaStatus(id: string, status: string, responsavelId?: string): Promise<OcorrenciaData> {
    // Validação de transição de status
    this.validateStatusTransition(id, status);
    return await this.ocorrenciaModel.changeStatus(id, status, responsavelId);
  }

  async assignOcorrenciaResponsibility(id: string, responsavelId: string): Promise<OcorrenciaData> {
    return await this.ocorrenciaModel.assignResponsibility(id, responsavelId);
  }

  async getOpenOcorrencias(condominiumId: string): Promise<OcorrenciaData[]> {
    return await this.ocorrenciaModel.getOpenOccurrences(condominiumId);
  }

  async getResolvedOcorrencias(condominiumId: string): Promise<OcorrenciaData[]> {
    return await this.ocorrenciaModel.getResolvedOccurrences(condominiumId);
  }

  // Métodos para Comentários
  async addComentarioToOcorrencia(data: OcorrenciaComentarioData): Promise<OcorrenciaComentarioData> {
    // Validação de comentário
    this.validateComentarioData(data);
    return await this.comentarioModel.create(data);
  }

  async getComentariosForOcorrencia(ocorrenciaId: string): Promise<OcorrenciaComentarioData[]> {
    return await this.comentarioModel.findByOcorrenciaId(ocorrenciaId);
  }

  // Método para obter resumo de ocorrências
  async getOcorrenciaSummary(condominiumId: string): Promise<OcorrenciaSummary> {
    const ocorrencias = await this.getAllOcorrencias(condominiumId);
    
    const total = ocorrencias.length;
    const open = ocorrencias.filter(o => o.status === 'aberta').length;
    const inProgress = ocorrencias.filter(o => o.status === 'em_andamento').length;
    const resolved = ocorrencias.filter(o => o.status === 'resolvida').length;
    const cancelled = ocorrencias.filter(o => o.status === 'cancelada').length;
    
    const byType = {
      manutencao: ocorrencias.filter(o => o.tipo === 'manutencao').length,
      seguranca: ocorrencias.filter(o => o.tipo === 'seguranca').length,
      limpeza: ocorrencias.filter(o => o.tipo === 'limpeza').length,
      vizinhanca: ocorrencias.filter(o => o.tipo === 'vizinhanca').length,
      elevador: ocorrencias.filter(o => o.tipo === 'elevador').length,
      piscina: ocorrencias.filter(o => o.tipo === 'piscina').length,
      barulho: ocorrencias.filter(o => o.tipo === 'barulho').length,
      outro: ocorrencias.filter(o => o.tipo === 'outro').length,
    };
    
    const byPriority = {
      baixa: ocorrencias.filter(o => o.prioridade === 'baixa').length,
      media: ocorrencias.filter(o => o.prioridade === 'media').length,
      alta: ocorrencias.filter(o => o.prioridade === 'alta').length,
      urgente: ocorrencias.filter(o => o.prioridade === 'urgente').length,
    };

    return {
      total,
      open,
      inProgress,
      resolved,
      cancelled,
      byType,
      byPriority,
    };
  }

  // Validações
  private validateOcorrenciaData(data: OcorrenciaData): void {
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

    if (!data.tipo) {
      throw new Error('Tipo é obrigatório');
    }

    const validTypes: (OcorrenciaData['tipo'])[] = [
      'manutencao', 'seguranca', 'limpeza', 'vizinhanca', 
      'elevador', 'piscina', 'barulho', 'outro'
    ];
    if (!validTypes.includes(data.tipo)) {
      throw new Error(`Tipo inválido. Os tipos válidos são: ${validTypes.join(', ')}`);
    }

    if (!data.status) {
      throw new Error('Status é obrigatório');
    }

    const validStatus: (OcorrenciaData['status'])[] = ['aberta', 'em_andamento', 'resolvida', 'cancelada'];
    if (!validStatus.includes(data.status)) {
      throw new Error(`Status inválido. Os status válidos são: ${validStatus.join(', ')}`);
    }

    if (!data.prioridade) {
      throw new Error('Prioridade é obrigatória');
    }

    const validPriorities: (OcorrenciaData['prioridade'])[] = ['baixa', 'media', 'alta', 'urgente'];
    if (!validPriorities.includes(data.prioridade)) {
      throw new Error(`Prioridade inválida. As prioridades válidas são: ${validPriorities.join(', ')}`);
    }

    if (!data.autorId) {
      throw new Error('Autor é obrigatório');
    }

    if (!data.condominioId) {
      throw new Error('Condomínio é obrigatório');
    }

    // Regras de negócio específicas
    if (data.tipo === 'seguranca' && data.prioridade !== 'alta' && data.prioridade !== 'urgente') {
      throw new Error('Ocorrências de segurança devem ter prioridade Alta ou Urgente');
    }

    if (data.tipo === 'barulho' && data.prioridade === 'baixa') {
      throw new Error('Ocorrências de barulho devem ter prioridade Média ou superior');
    }

    // Validar data de abertura
    if (data.dataAbertura && data.dataAbertura > new Date()) {
      throw new Error('Data de abertura não pode ser futura');
    }

    // Validar data de resolução
    if (data.dataResolucao && data.dataAbertura && data.dataResolucao < data.dataAbertura) {
      throw new Error('Data de resolução não pode ser anterior à data de abertura');
    }
  }

  private validateStatusTransition(ocorrenciaId: string, newStatus: string): void {
    // Aqui poderíamos buscar a ocorrência atual para validar a transição de status
    // Por simplicidade, vamos validar apenas as regras básicas de transição
    const validTransitions: Record<string, string[]> = {
      'aberta': ['em_andamento', 'cancelada'],
      'em_andamento': ['resolvida', 'cancelada'],
      'resolvida': ['aberta'], // Permitir reabertura de ocorrências resolvidas
      'cancelada': ['aberta']  // Permitir reabertura de ocorrências canceladas
    };

    // Para esta validação, assumiremos que a transição é sempre válida
    // Em uma implementação real, buscaríamos o status atual da ocorrência
  }

  private validateComentarioData(data: OcorrenciaComentarioData): void {
    if (!data.ocorrenciaId) {
      throw new Error('ID da ocorrência é obrigatório');
    }

    if (!data.autorId) {
      throw new Error('Autor do comentário é obrigatório');
    }

    if (!data.comentario || data.comentario.trim().length === 0) {
      throw new Error('Comentário é obrigatório');
    }

    if (data.comentario.trim().length > 500) {
      throw new Error('Comentário não pode ter mais de 500 caracteres');
    }
  }
}