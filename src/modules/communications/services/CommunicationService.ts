import { ComunicadoModel, ComunicadoData } from './models/Comunicado';
import { ComunicadoLeituraModel } from './models/ComunicadoLeitura';

export interface ComunicadoSummary {
  total: number;
  unread: number;
  fixed: number;
  byPriority: {
    baixa: number;
    normal: number;
    alta: number;
    urgente: number;
  };
  byType: {
    aviso_geral: number;
    manutencao: number;
    assembleia: number;
    evento: number;
    seguranca: number;
    regra: number;
  };
}

export class CommunicationService {
  private comunicadoModel: ComunicadoModel;
  private leituraModel: ComunicadoLeituraModel;

  constructor() {
    this.comunicadoModel = new ComunicadoModel();
    this.leituraModel = new ComunicadoLeituraModel();
  }

  // Métodos para Comunicados
  async createComunicado(data: ComunicadoData): Promise<ComunicadoData> {
    // Validação de dados
    this.validateComunicadoData(data);
    return await this.comunicadoModel.create(data);
  }

  async getComunicadoById(id: string): Promise<ComunicadoData | null> {
    return await this.comunicadoModel.findById(id);
  }

  async getAllComunicados(condominiumId: string, filters?: any): Promise<ComunicadoData[]> {
    return await this.comunicadoModel.findAll(condominiumId, filters);
  }

  async updateComunicado(id: string, data: Partial<ComunicadoData>): Promise<ComunicadoData> {
    // Validação de dados se campos importantes forem atualizados
    if (data.titulo || data.conteudo || data.tipo || data.prioridade) {
      const currentComunicado = await this.comunicadoModel.findById(id);
      if (currentComunicado) {
        const updatedData = { ...currentComunicado, ...data } as ComunicadoData;
        this.validateComunicadoData(updatedData);
      }
    }
    return await this.comunicadoModel.update(id, data);
  }

  async deleteComunicado(id: string): Promise<void> {
    await this.comunicadoModel.delete(id);
  }

  async pinComunicado(id: string): Promise<ComunicadoData> {
    return await this.comunicadoModel.pin(id);
  }

  async unpinComunicado(id: string): Promise<ComunicadoData> {
    return await this.comunicadoModel.unpin(id);
  }

  async getFixedComunicados(condominiumId: string): Promise<ComunicadoData[]> {
    return await this.comunicadoModel.getFixedMessages(condominiumId);
  }

  // Métodos para Leitura
  async markComunicadoAsRead(userId: string, comunicadoId: string): Promise<void> {
    await this.leituraModel.markAsRead(userId, comunicadoId);
  }

  async getUnreadCount(userId: string, condominioId: string): Promise<number> {
    return await this.leituraModel.getUnreadCount(userId, condominioId);
  }

  async isComunicadoRead(userId: string, comunicadoId: string): Promise<boolean> {
    const leitura = await this.leituraModel.findByUserAndComunicado(userId, comunicadoId);
    return !!leitura;
  }

  // Método para obter resumo de comunicações
  async getComunicadoSummary(condominiumId: string): Promise<ComunicadoSummary> {
    const comunicados = await this.getAllComunicados(condominiumId);
    
    const total = comunicados.length;
    const fixed = comunicados.filter(c => c.fixado).length;
    
    const byPriority = {
      baixa: comunicados.filter(c => c.prioridade === 'baixa').length,
      normal: comunicados.filter(c => c.prioridade === 'normal').length,
      alta: comunicados.filter(c => c.prioridade === 'alta').length,
      urgente: comunicados.filter(c => c.prioridade === 'urgente').length,
    };
    
    const byType = {
      aviso_geral: comunicados.filter(c => c.tipo === 'aviso_geral').length,
      manutencao: comunicados.filter(c => c.tipo === 'manutencao').length,
      assembleia: comunicados.filter(c => c.tipo === 'assembleia').length,
      evento: comunicados.filter(c => c.tipo === 'evento').length,
      seguranca: comunicados.filter(c => c.tipo === 'seguranca').length,
      regra: comunicados.filter(c => c.tipo === 'regra').length,
    };

    // O número de não lidos será calculado por usuário, então retornamos 0 aqui
    // O valor real será obtido quando for solicitado por usuário específico
    return {
      total,
      unread: 0, // Este valor será substituído quando for solicitado por usuário
      fixed,
      byPriority,
      byType,
    };
  }

  async getComunicadoSummaryForUser(userId: string, condominioId: string): Promise<ComunicadoSummary> {
    const summary = await this.getComunicadoSummary(condominioId);
    const unread = await this.getUnreadCount(userId, condominioId);
    
    return {
      ...summary,
      unread,
    };
  }

  // Validações
  private validateComunicadoData(data: ComunicadoData): void {
    if (!data.titulo || data.titulo.trim().length === 0) {
      throw new Error('Título é obrigatório');
    }

    if (data.titulo.trim().length > 200) {
      throw new Error('Título não pode ter mais de 200 caracteres');
    }

    if (!data.conteudo || data.conteudo.trim().length === 0) {
      throw new Error('Conteúdo é obrigatório');
    }

    if (data.conteudo.trim().length < 10) {
      throw new Error('Conteúdo deve ter pelo menos 10 caracteres');
    }

    if (data.conteudo.trim().length > 5000) {
      throw new Error('Conteúdo não pode ter mais de 5000 caracteres');
    }

    if (!data.tipo) {
      throw new Error('Tipo é obrigatório');
    }

    const validTypes: (ComunicadoData['tipo'])[] = ['aviso_geral', 'manutencao', 'assembleia', 'evento', 'seguranca', 'regra'];
    if (!validTypes.includes(data.tipo)) {
      throw new Error(`Tipo inválido. Os tipos válidos são: ${validTypes.join(', ')}`);
    }

    if (!data.prioridade) {
      throw new Error('Prioridade é obrigatória');
    }

    const validPriorities: (ComunicadoData['prioridade'])[] = ['baixa', 'normal', 'alta', 'urgente'];
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
    if (data.tipo === 'assembleia' && data.prioridade !== 'alta' && data.prioridade !== 'urgente') {
      throw new Error('Comunicados do tipo Assembleia devem ter prioridade Alta ou Urgente');
    }
  }
}