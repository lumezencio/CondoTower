import React, { useState, useEffect } from 'react';
import { DeliveryService, DeliverySummary } from '../services/DeliveryService';

interface DeliveryDashboardProps {
  condominiumId: string;
}

const DeliveryDashboard: React.FC<DeliveryDashboardProps> = ({ condominiumId }) => {
  const [summary, setSummary] = useState<DeliverySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const deliveryService = new DeliveryService();

  useEffect(() => {
    loadDeliverySummary();
  }, [condominiumId]);

  const loadDeliverySummary = async () => {
    try {
      const summaryData = await deliveryService.getDeliverySummary(condominiumId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Erro ao carregar resumo de encomendas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando resumo de encomendas...</div>;
  }

  if (!summary) {
    return <div className="text-center py-4">Nenhum dado de encomendas encontrado.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard de Encomendas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Total de Encomendas</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summary.total}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Aguardando Retirada</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600">{summary.awaitingPickup}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Retiradas</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{summary.delivered}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Notificações Pendentes</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">{summary.pendingNotifications}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Encomendas por Tipo</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Correios</span>
              <span className="font-medium">{summary.byType.correios}</span>
            </div>
            <div className="flex justify-between">
              <span>SEDEX</span>
              <span className="font-medium">{summary.byType.sedex}</span>
            </div>
            <div className="flex justify-between">
              <span>Transportadora</span>
              <span className="font-medium">{summary.byType.transportadora}</span>
            </div>
            <div className="flex justify-between">
              <span>Entregador</span>
              <span className="font-medium">{summary.byType.entregador}</span>
            </div>
            <div className="flex justify-between">
              <span>Outros</span>
              <span className="font-medium">{summary.byType.outro}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Status Atual</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Aguardando Retirada</span>
              <span className="font-medium">{summary.awaitingPickup}</span>
            </div>
            <div className="flex justify-between">
              <span>Retiradas</span>
              <span className="font-medium">{summary.delivered}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-500 mb-4">Análise</h3>
        <p className="text-gray-600">
          O condomínio tem {summary.total} encomendas registradas, com {summary.awaitingPickup} aguardando retirada. 
          {summary.total > 0 ? ` O índice de retirada é de ${((summary.delivered / summary.total) * 100).toFixed(1)}%.` : ''}
          Existem {summary.pendingNotifications} encomendas que estão há mais de 3 dias aguardando retirada.
        </p>
      </div>
    </div>
  );
};

export default DeliveryDashboard;