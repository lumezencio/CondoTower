import React, { useState, useEffect } from 'react';
import { CommunicationService, ComunicadoSummary } from '../services/CommunicationService';

interface CommunicationDashboardProps {
  condominiumId: string;
  userId: string;
}

const CommunicationDashboard: React.FC<CommunicationDashboardProps> = ({ condominiumId, userId }) => {
  const [summary, setSummary] = useState<ComunicadoSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const communicationService = new CommunicationService();

  useEffect(() => {
    loadCommunicationSummary();
  }, [condominiumId, userId]);

  const loadCommunicationSummary = async () => {
    try {
      const summaryData = await communicationService.getComunicadoSummaryForUser(userId, condominiumId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Erro ao carregar resumo de comunicações:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando resumo de comunicações...</div>;
  }

  if (!summary) {
    return <div className="text-center py-4">Nenhum dado de comunicação encontrado.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard de Comunicações</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Total de Comunicados</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summary.total}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Não Lidos</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">{summary.unread}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Fixados</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600">{summary.fixed}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Urgentes</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">{summary.byPriority.urgente}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Por Prioridade</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Baixa</span>
              <span className="font-medium">{summary.byPriority.baixa}</span>
            </div>
            <div className="flex justify-between">
              <span>Normal</span>
              <span className="font-medium">{summary.byPriority.normal}</span>
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
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Por Tipo</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Aviso Geral</span>
              <span className="font-medium">{summary.byType.aviso_geral}</span>
            </div>
            <div className="flex justify-between">
              <span>Manutenção</span>
              <span className="font-medium">{summary.byType.manutencao}</span>
            </div>
            <div className="flex justify-between">
              <span>Assembleia</span>
              <span className="font-medium">{summary.byType.assembleia}</span>
            </div>
            <div className="flex justify-between">
              <span>Evento</span>
              <span className="font-medium">{summary.byType.evento}</span>
            </div>
            <div className="flex justify-between">
              <span>Segurança</span>
              <span className="font-medium">{summary.byType.seguranca}</span>
            </div>
            <div className="flex justify-between">
              <span>Regra</span>
              <span className="font-medium">{summary.byType.regra}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-500 mb-4">Últimos Comunicados</h3>
        <p className="text-gray-600">Visualize os comunicados mais recentes na aba de Comunicados</p>
      </div>
    </div>
  );
};

export default CommunicationDashboard;