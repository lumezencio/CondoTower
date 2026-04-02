import React, { useState, useEffect } from 'react';
import { DocumentService, DocumentoSummary } from '../services/DocumentService';

interface DocumentDashboardProps {
  condominiumId: string;
}

const DocumentDashboard: React.FC<DocumentDashboardProps> = ({ condominiumId }) => {
  const [summary, setSummary] = useState<DocumentoSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const documentService = new DocumentService();

  useEffect(() => {
    loadDocumentSummary();
  }, [condominiumId]);

  const loadDocumentSummary = async () => {
    try {
      const summaryData = await documentService.getDocumentoSummary(condominiumId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Erro ao carregar resumo de documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando resumo de documentos...</div>;
  }

  if (!summary) {
    return <div className="text-center py-4">Nenhum dado de documento encontrado.</div>;
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard de Documentos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Total de Documentos</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summary.total}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Espaço Utilizado</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatFileSize(summary.totalSize)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Mais Acessados</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">-</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Recentes</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">-</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Por Categoria</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Atas de Assembleia</span>
              <span className="font-medium">{summary.byCategory.ata_assembleia}</span>
            </div>
            <div className="flex justify-between">
              <span>Convenções</span>
              <span className="font-medium">{summary.byCategory.convencao}</span>
            </div>
            <div className="flex justify-between">
              <span>Regimento Interno</span>
              <span className="font-medium">{summary.byCategory.regimento_interno}</span>
            </div>
            <div className="flex justify-between">
              <span>Contratos</span>
              <span className="font-medium">{summary.byCategory.contrato}</span>
            </div>
            <div className="flex justify-between">
              <span>Apólices de Seguro</span>
              <span className="font-medium">{summary.byCategory.apolice_seguro}</span>
            </div>
            <div className="flex justify-between">
              <span>Fiscais</span>
              <span className="font-medium">{summary.byCategory.fiscal}</span>
            </div>
            <div className="flex justify-between">
              <span>Projetos/Plantas</span>
              <span className="font-medium">{summary.byCategory.projeto_planta}</span>
            </div>
            <div className="flex justify-between">
              <span>Manuais</span>
              <span className="font-medium">{summary.byCategory.manual_equipamento}</span>
            </div>
            <div className="flex justify-between">
              <span>Outros</span>
              <span className="font-medium">{summary.byCategory.outro}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Por Visibilidade</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Todos</span>
              <span className="font-medium">{summary.byVisibility.todos}</span>
            </div>
            <div className="flex justify-between">
              <span>Conselho</span>
              <span className="font-medium">{summary.byVisibility.conselho}</span>
            </div>
            <div className="flex justify-between">
              <span>Administração</span>
              <span className="font-medium">{summary.byVisibility.administracao}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-500 mb-4">Resumo</h3>
        <p className="text-gray-600">
          O condomínio possui {summary.total} documentos organizados em {Object.values(summary.byCategory).filter(count => count > 0).length} categorias diferentes, 
          ocupando um total de {formatFileSize(summary.totalSize)}. 
          {summary.total > 0 ? ` A média de tamanho por documento é de ${formatFileSize(summary.totalSize / summary.total)}.` : ''}
        </p>
      </div>
    </div>
  );
};

export default DocumentDashboard;