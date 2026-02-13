import React, { useState, useEffect } from 'react';
import { OccurrenceService, OcorrenciaSummary } from '../services/OccurrenceService';

interface OccurrenceDashboardProps {
  condominiumId: string;
}

const OccurrenceDashboard: React.FC<OccurrenceDashboardProps> = ({ condominiumId }) => {
  const [summary, setSummary] = useState<OcorrenciaSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const occurrenceService = new OccurrenceService();

  useEffect(() => {
    loadOccurrenceSummary();
  }, [condominiumId]);

  const loadOccurrenceSummary = async () => {
    try {
      const summaryData = await occurrenceService.getOcorrenciaSummary(condominiumId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Erro ao carregar resumo de ocorrências:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando resumo de ocorrências...</div>;
  }

  if (!summary) {
    return <div className="text-center py-4">Nenhum dado de ocorrência encontrado.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard de Ocorrências</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Total de Ocorrências</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summary.total}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Abertas</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600">{summary.open}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Em Andamento</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{summary.inProgress}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Resolvidas</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{summary.resolved}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Por Tipo</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Manutenção</span>
              <span className="font-medium">{summary.byType.manutencao}</span>
            </div>
            <div className="flex justify-between">
              <span>Segurança</span>
              <span className="font-medium">{summary.byType.seguranca}</span>
            </div>
            <div className="flex justify-between">
              <span>Limpeza</span>
              <span className="font-medium">{summary.byType.limpeza}</span>
            </div>
            <div className="flex justify-between">
              <span>Vizinhança</span>
              <span className="font-medium">{summary.byType.vizinhanca}</span>
            </div>
            <div className="flex justify-between">
              <span>Elevador</span>
              <span className="font-medium">{summary.byType.elevador}</span>
            </div>
            <div className="flex justify-between">
              <span>Piscina</span>
              <span className="font-medium">{summary.byType.piscina}</span>
            </div>
            <div className="flex justify-between">
              <span>Barulho</span>
              <span className="font-medium">{summary.byType.barulho}</span>
            </div>
            <div className="flex justify-between">
              <span>Outros</span>
              <span className="font-medium">{summary.byType.outro}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Por Prioridade</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Baixa</span>
              <span className="font-medium">{summary.byPriority.baixa}</span>
            </div>
            <div className="flex justify-between">
              <span>Média</span>
              <span className="font-medium">{summary.byPriority.media}</span>
            </div>
            <div className="flex justify-between">
              <span>Alta</span>
              <span className="font-medium">{summary.byPriority.alta}</span>
            </div>
            <div className="flex justify-between">
              <span>Urgente</span>
              <span className="font-medium">{summary.byPriority.urgente}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-500 mb-4">Análise</h3>
        <p className="text-gray-600">
          O condomínio tem {summary.total} ocorrências registradas, com {summary.open} abertas e {summary.inProgress} em andamento. 
          {summary.total > 0 ? ` A taxa de resolução é de ${(summary.resolved / summary.total * 100).toFixed(1)}%.` : ''}
        </p>
      </div>
    </div>
  );
};

export default OccurrenceDashboard;