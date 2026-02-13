import { PrismaClient, Documento as PrismaDocumento } from '@prisma/client';

export interface DocumentoData {
  id?: string;
  nome: string;
  descricao?: string;
  categoria: 'ata_assembleia' | 'convencao' | 'regimento_interno' | 'contrato' | 'apolice_seguro' | 'fiscal' | 'projeto_planta' | 'manual_equipamento' | 'outro';
  arquivoUrl: string;
  tamanho: number; // bytes
  tipoArquivo: string; // extensão do arquivo
  visibilidade: 'administracao' | 'conselho' | 'todos';
  autorId: string;
  condominioId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DocumentoModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: DocumentoData): Promise<DocumentoData> {
    const documento = await this.prisma.documento.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        categoria: this.mapCategoriaToPrisma(data.categoria),
        arquivo_url: data.arquivoUrl,
        tamanho: data.tamanho,
        tipo_arquivo: data.tipoArquivo,
        visibilidade: this.mapVisibilidadeToPrisma(data.visibilidade),
        autor_id: data.autorId,
        condominio_id: data.condominioId,
      },
    });
    return this.mapPrismaToInterface(documento);
  }

  async findById(id: string): Promise<DocumentoData | null> {
    const documento = await this.prisma.documento.findUnique({
      where: { id },
    });
    return documento ? this.mapPrismaToInterface(documento) : null;
  }

  async findAll(condominiumId: string, filters?: any): Promise<DocumentoData[]> {
    const documentos = await this.prisma.documento.findMany({
      where: {
        condominio_id: condominiumId,
        ...filters,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return documentos.map(documento => this.mapPrismaToInterface(documento));
  }

  async update(id: string, data: Partial<DocumentoData>): Promise<DocumentoData> {
    const updatedDocumento = await this.prisma.documento.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedDocumento);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.documento.delete({
      where: { id },
    });
  }

  async getByCategory(condominiumId: string, category: string): Promise<DocumentoData[]> {
    const documentos = await this.prisma.documento.findMany({
      where: {
        condominio_id: condominiumId,
        categoria: this.mapCategoriaToPrisma(category as any),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return documentos.map(documento => this.mapPrismaToInterface(documento));
  }

  async searchByTerm(condominiumId: string, searchTerm: string): Promise<DocumentoData[]> {
    const documentos = await this.prisma.documento.findMany({
      where: {
        condominio_id: condominiumId,
        OR: [
          { nome: { contains: searchTerm, mode: 'insensitive' } },
          { descricao: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return documentos.map(documento => this.mapPrismaToInterface(documento));
  }

  private mapPrismaToInterface(prismaDocumento: PrismaDocumento): DocumentoData {
    return {
      id: prismaDocumento.id,
      nome: prismaDocumento.nome,
      descricao: prismaDocumento.descricao || undefined,
      categoria: this.mapCategoriaFromPrisma(prismaDocumento.categoria),
      arquivoUrl: prismaDocumento.arquivo_url,
      tamanho: prismaDocumento.tamanho,
      tipoArquivo: prismaDocumento.tipo_arquivo,
      visibilidade: this.mapVisibilidadeFromPrisma(prismaDocumento.visibilidade),
      autorId: prismaDocumento.autor_id,
      condominioId: prismaDocumento.condominio_id,
      createdAt: prismaDocumento.created_at,
      updatedAt: prismaDocumento.updated_at,
    };
  }

  private mapCategoriaToPrisma(categoria: string): string {
    switch(categoria) {
      case 'ata_assembleia': return 'ATA_ASSEMBLEIA';
      case 'convencao': return 'CONVENCAO';
      case 'regimento_interno': return 'REGIMENTO_INTERNO';
      case 'contrato': return 'CONTRATO';
      case 'apolice_seguro': return 'APOLICE_SEGURO';
      case 'fiscal': return 'FISCAL';
      case 'projeto_planta': return 'PROJETO_PLANTA';
      case 'manual_equipamento': return 'MANUAL_EQUIPAMENTO';
      case 'outro': return 'OUTRO';
      default: return 'OUTRO';
    }
  }

  private mapCategoriaFromPrisma(categoria: string): 'ata_assembleia' | 'convencao' | 'regimento_interno' | 'contrato' | 'apolice_seguro' | 'fiscal' | 'projeto_planta' | 'manual_equipamento' | 'outro' {
    switch(categoria) {
      case 'ATA_ASSEMBLEIA': return 'ata_assembleia';
      case 'CONVENCAO': return 'convencao';
      case 'REGIMENTO_INTERNO': return 'regimento_interno';
      case 'CONTRATO': return 'contrato';
      case 'APOLICE_SEGURO': return 'apolice_seguro';
      case 'FISCAL': return 'fiscal';
      case 'PROJETO_PLANTA': return 'projeto_planta';
      case 'MANUAL_EQUIPAMENTO': return 'manual_equipamento';
      case 'OUTRO': return 'outro';
      default: return 'outro';
    }
  }

  private mapVisibilidadeToPrisma(visibilidade: string): string {
    switch(visibilidade) {
      case 'administracao': return 'ADMINISTRACAO';
      case 'conselho': return 'CONSELHO';
      case 'todos': return 'TODOS';
      default: return 'TODOS';
    }
  }

  private mapVisibilidadeFromPrisma(visibilidade: string): 'administracao' | 'conselho' | 'todos' {
    switch(visibilidade) {
      case 'ADMINISTRACAO': return 'administracao';
      case 'CONSELHO': return 'conselho';
      case 'TODOS': return 'todos';
      default: return 'todos';
    }
  }
}