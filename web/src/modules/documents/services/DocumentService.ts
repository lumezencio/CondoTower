import { DocumentoModel, DocumentoData } from './models/Documento';

export interface DocumentoSummary {
  total: number;
  byCategory: {
    ata_assembleia: number;
    convencao: number;
    regimento_interno: number;
    contrato: number;
    apolice_seguro: number;
    fiscal: number;
    projeto_planta: number;
    manual_equipamento: number;
    outro: number;
  };
  byVisibility: {
    administracao: number;
    conselho: number;
    todos: number;
  };
  totalSize: number; // em bytes
}

export class DocumentService {
  private documentoModel: DocumentoModel;

  constructor() {
    this.documentoModel = new DocumentoModel();
  }

  // Métodos para Documentos
  async createDocumento(data: DocumentoData): Promise<DocumentoData> {
    // Validação de dados
    this.validateDocumentoData(data);
    return await this.documentoModel.create(data);
  }

  async getDocumentoById(id: string): Promise<DocumentoData | null> {
    return await this.documentoModel.findById(id);
  }

  async getAllDocumentos(condominiumId: string, filters?: any): Promise<DocumentoData[]> {
    return await this.documentoModel.findAll(condominiumId, filters);
  }

  async updateDocumento(id: string, data: Partial<DocumentoData>): Promise<DocumentoData> {
    // Validação de dados se campos importantes forem atualizados
    if (data.nome || data.categoria || data.visibilidade || data.arquivoUrl) {
      const currentDocumento = await this.documentoModel.findById(id);
      if (currentDocumento) {
        const updatedData = { ...currentDocumento, ...data } as DocumentoData;
        this.validateDocumentoData(updatedData);
      }
    }
    return await this.documentoModel.update(id, data);
  }

  async deleteDocumento(id: string): Promise<void> {
    await this.documentoModel.delete(id);
  }

  async getDocumentosByCategory(condominiumId: string, category: string): Promise<DocumentoData[]> {
    return await this.documentoModel.getByCategory(condominiumId, category);
  }

  async searchDocumentos(condominiumId: string, searchTerm: string): Promise<DocumentoData[]> {
    return await this.documentoModel.searchByTerm(condominiumId, searchTerm);
  }

  // Método para obter resumo de documentos
  async getDocumentoSummary(condominiumId: string): Promise<DocumentoSummary> {
    const documentos = await this.getAllDocumentos(condominiumId);
    
    const total = documentos.length;
    
    const byCategory = {
      ata_assembleia: documentos.filter(d => d.categoria === 'ata_assembleia').length,
      convencao: documentos.filter(d => d.categoria === 'convencao').length,
      regimento_interno: documentos.filter(d => d.categoria === 'regimento_interno').length,
      contrato: documentos.filter(d => d.categoria === 'contrato').length,
      apolice_seguro: documentos.filter(d => d.categoria === 'apolice_seguro').length,
      fiscal: documentos.filter(d => d.categoria === 'fiscal').length,
      projeto_planta: documentos.filter(d => d.categoria === 'projeto_planta').length,
      manual_equipamento: documentos.filter(d => d.categoria === 'manual_equipamento').length,
      outro: documentos.filter(d => d.categoria === 'outro').length,
    };
    
    const byVisibility = {
      administracao: documentos.filter(d => d.visibilidade === 'administracao').length,
      conselho: documentos.filter(d => d.visibilidade === 'conselho').length,
      todos: documentos.filter(d => d.visibilidade === 'todos').length,
    };

    const totalSize = documentos.reduce((sum, doc) => sum + doc.tamanho, 0);

    return {
      total,
      byCategory,
      byVisibility,
      totalSize,
    };
  }

  // Validações
  private validateDocumentoData(data: DocumentoData): void {
    if (!data.nome || data.nome.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }

    if (data.nome.trim().length > 200) {
      throw new Error('Nome não pode ter mais de 200 caracteres');
    }

    if (data.descricao && data.descricao.length > 1000) {
      throw new Error('Descrição não pode ter mais de 1000 caracteres');
    }

    if (!data.categoria) {
      throw new Error('Categoria é obrigatória');
    }

    const validCategories: (DocumentoData['categoria'])[] = [
      'ata_assembleia', 'convencao', 'regimento_interno', 'contrato', 
      'apolice_seguro', 'fiscal', 'projeto_planta', 'manual_equipamento', 'outro'
    ];
    if (!validCategories.includes(data.categoria)) {
      throw new Error(`Categoria inválida. As categorias válidas são: ${validCategories.join(', ')}`);
    }

    if (!data.arquivoUrl || data.arquivoUrl.trim().length === 0) {
      throw new Error('URL do arquivo é obrigatória');
    }

    if (!data.tipoArquivo || data.tipoArquivo.trim().length === 0) {
      throw new Error('Tipo de arquivo é obrigatório');
    }

    if (data.tamanho <= 0) {
      throw new Error('Tamanho do arquivo deve ser maior que zero');
    }

    if (data.tamanho > 50 * 1024 * 1024) { // 50 MB
      throw new Error('Tamanho do arquivo não pode exceder 50 MB');
    }

    if (!data.visibilidade) {
      throw new Error('Visibilidade é obrigatória');
    }

    const validVisibilities: (DocumentoData['visibilidade'])[] = ['administracao', 'conselho', 'todos'];
    if (!validVisibilities.includes(data.visibilidade)) {
      throw new Error(`Visibilidade inválida. As visibilidades válidas são: ${validVisibilities.join(', ')}`);
    }

    if (!data.autorId) {
      throw new Error('Autor é obrigatório');
    }

    if (!data.condominioId) {
      throw new Error('Condomínio é obrigatório');
    }

    // Regras de negócio específicas
    if (data.categoria === 'ata_assembleia' && data.visibilidade !== 'todos') {
      throw new Error('Atas de assembleia devem ter visibilidade para todos');
    }

    // Validar formato do arquivo com base na categoria
    this.validateFileType(data.categoria, data.tipoArquivo);
  }

  private validateFileType(categoria: string, tipoArquivo: string): void {
    const validExtensions: Record<string, string[]> = {
      'ata_assembleia': ['pdf', 'doc', 'docx'],
      'convencao': ['pdf', 'doc', 'docx'],
      'regimento_interno': ['pdf', 'doc', 'docx'],
      'contrato': ['pdf', 'doc', 'docx'],
      'apolice_seguro': ['pdf', 'jpg', 'jpeg', 'png'],
      'fiscal': ['pdf', 'xml', 'doc', 'docx'],
      'projeto_planta': ['pdf', 'dwg', 'dxf', 'jpg', 'jpeg', 'png'],
      'manual_equipamento': ['pdf', 'doc', 'docx'],
      'outro': ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt', 'rtf']
    };

    const extensions = validExtensions[categoria] || validExtensions['outro'];
    const fileType = tipoArquivo.toLowerCase();
    
    if (!extensions.includes(fileType)) {
      throw new Error(`Formato de arquivo inválido para a categoria "${categoria}". Formatos válidos: ${extensions.join(', ')}`);
    }
  }
}