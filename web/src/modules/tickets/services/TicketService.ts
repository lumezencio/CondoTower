// Módulo simplificado para usar apenas APIs REST
// Os tipos são definidos aqui para não depender do Prisma no client

export interface ChamadoData {
  id?: string;
  condominioId: string;
  apartamentoId?: string;
  tipo: 'manutencao_preventiva' | 'manutencao_corretiva' | 'solicitacao_servico' | 'reclamacao' | 'sugestao' | 'emergencia';
  categoria: 'eletrica' | 'hidraulica' | 'elevador' | 'ar_condicionado' | 'piscina' | 'jardim' | 'limpeza' | 'seguranca' | 'estrutural' | 'eletronica' | 'telefonia' | 'internet' | 'gas' | 'incendio' | 'outro';
  titulo: string;
  descricao: string;
  status: 'aberto' | 'em_analise' | 'aprovado' | 'aguardando_pecas' | 'em_andamento' | 'concluido' | 'cancelado';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente' | 'emergencia';
  localAfetado?: string;
  fotos?: string[];
  autorId: string;
  responsavelId?: string;
  fornecedorId?: string;
  dataAbertura: Date;
  dataPrevisao?: Date;
  dataResolucao?: Date;
  solucao?: string;
  custo?: number;
  observacoes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChamadoItemData {
  id?: string;
  chamadoId: string;
  descricao: string;
  quantidade: number;
  valorUnitario?: number;
  valorTotal?: number;
  tipo: 'servico' | 'material' | 'pecas' | 'outro';
  observacoes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChamadoHistoricoData {
  id?: string;
  chamadoId: string;
  usuarioId: string;
  acao: 'abertura' | 'alteracao_status' | 'alteracao_prioridade' | 'atribuicao_responsavel' | 'adicao_item' | 'remocao_item' | 'alteracao_custo' | 'conclusao' | 'cancelamento' | 'reabertura' | 'observacao';
  descricao: string;
  statusAnterior?: string;
  statusNovo?: string;
  valorAnterior?: number;
  valorNovo?: number;
  createdAt?: Date;
}

export interface ChamadoSummary {
  total: number;
  abertos: number;
  emAnalise: number;
  aprovados: number;
  aguardandoPecas: number;
  emAndamento: number;
  concluidos: number;
  cancelados: number;
  custoTotal: number;
}

// Service simplificado usando apenas fetch
export class TicketService {
  private baseUrl = '/api/tickets';

  async getAllChamados(condominioId: string, filters?: any): Promise<ChamadoData[]> {
    const params = new URLSearchParams({ condominioId, page: '1', pageSize: '100' });
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    
    const res = await fetch(`${this.baseUrl}?${params}`);
    const data = await res.json();
    if (data.ok) return data.data;
    throw new Error(data.message || 'Erro ao carregar chamados');
  }

  async getChamadoById(id: string): Promise<ChamadoData | null> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    const data = await res.json();
    if (data.ok) return data.data;
    return null;
  }

  async createChamado(data: ChamadoData): Promise<ChamadoData> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.ok) return result.data;
    throw new Error(result.message || 'Erro ao criar chamado');
  }

  async updateChamado(id: string, data: Partial<ChamadoData>): Promise<ChamadoData> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.ok) return result.data;
    throw new Error(result.message || 'Erro ao atualizar chamado');
  }

  async deleteChamado(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!result.ok) throw new Error(result.message || 'Erro ao excluir chamado');
  }

  async changeChamadoStatus(id: string, status: string): Promise<ChamadoData> {
    return this.updateChamado(id, { status });
  }

  async getChamadoSummary(condominioId: string): Promise<ChamadoSummary> {
    const params = new URLSearchParams({ condominioId });
    const res = await fetch(`${this.baseUrl}/summary?${params}`);
    const data = await res.json();
    if (data.ok) return data.data;
    throw new Error(data.message || 'Erro ao carregar resumo');
  }
}
