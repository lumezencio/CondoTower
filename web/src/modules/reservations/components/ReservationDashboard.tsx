import React, { useState, useEffect } from 'react';
import { ReservationService, ReservationSummary } from '../services/ReservationService';

interface ReservationDashboardProps {
  condominiumId: string;
}

const ReservationDashboard: React.FC<ReservationDashboardProps> = ({ condominiumId }) => {
  const [summary, setSummary] = useState<ReservationSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const reservationService = new ReservationService();

  useEffect(() => {
    loadReservationSummary();
  }, [condominiumId]);

  const loadReservationSummary = async () => {
    try {
      const summaryData = await reservationService.getReservationSummary(condominiumId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Erro ao carregar resumo de reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando resumo de reservas...</div>;
  }

  if (!summary) {
    return <div className="text-center py-4">Nenhum dado de reserva encontrado.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard de Reservas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Total de Reservas</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summary.total}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Pendentes</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600">{summary.pending}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Aprovadas</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{summary.approved}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Próximas 7 Dias</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{summary.upcoming}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Reservas por Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Pendentes</span>
              <span className="font-medium">{summary.pending}</span>
            </div>
            <div className="flex justify-between">
              <span>Aprovadas</span>
              <span className="font-medium">{summary.approved}</span>
            </div>
            <div className="flex justify-between">
              <span>Rejeitadas</span>
              <span className="font-medium">{summary.rejected}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Reservas por Área</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {Object.entries(summary.byArea).map(([areaId, count]) => (
              <div key={areaId} className="flex justify-between">
                <span>{areaId}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-500 mb-4">Análise</h3>
        <p className="text-gray-600">
          O condomínio tem {summary.total} reservas registradas, com {summary.pending} pendentes de aprovação. 
          {summary.total > 0 ? ` A taxa de aprovação é de ${((summary.approved / summary.total) * 100).toFixed(1)}%.` : ''}
          Nas próximas 7 dias, há {summary.upcoming} reservas agendadas.
        </p>
      </div>
    </div>
  );
};

export default ReservationDashboard;