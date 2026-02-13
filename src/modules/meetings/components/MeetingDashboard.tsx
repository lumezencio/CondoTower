import React, { useState, useEffect } from 'react';
import { MeetingService, MeetingSummary } from '../services/MeetingService';

interface MeetingDashboardProps {
  condominiumId: string;
}

const MeetingDashboard: React.FC<MeetingDashboardProps> = ({ condominiumId }) => {
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const meetingService = new MeetingService();

  useEffect(() => {
    loadMeetingSummary();
  }, [condominiumId]);

  const loadMeetingSummary = async () => {
    try {
      const summaryData = await meetingService.getMeetingSummary(condominiumId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Erro ao carregar resumo de assembleias:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando resumo de assembleias...</div>;
  }

  if (!summary) {
    return <div className="text-center py-4">Nenhum dado de assembleias encontrado.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard de Assembleias</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Total de Assembleias</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summary.total}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Convocadas</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{summary.byStatus.convocada}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Em Andamento</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600">{summary.byStatus.em_andamento}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Próximas 30 Dias</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{summary.upcoming}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Assembleias por Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Convocada</span>
              <span className="font-medium">{summary.byStatus.convocada}</span>
            </div>
            <div className="flex justify-between">
              <span>Em Andamento</span>
              <span className="font-medium">{summary.byStatus.em_andamento}</span>
            </div>
            <div className="flex justify-between">
              <span>Concluída</span>
              <span className="font-medium">{summary.byStatus.concluida}</span>
            </div>
            <div className="flex justify-between">
              <span>Cancelada</span>
              <span className="font-medium">{summary.byStatus.cancelada}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Assembleias por Tipo</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Ordinária</span>
              <span className="font-medium">{summary.byType.ordinaria}</span>
            </div>
            <div className="flex justify-between">
              <span>Extraordinária</span>
              <span className="font-medium">{summary.byType.extraordinaria}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-500 mb-4">Análise</h3>
        <p className="text-gray-600">
          O condomínio tem {summary.total} assembleias registradas. 
          {summary.total > 0 ? ` Destas, ${summary.byStatus.concluida} já foram realizadas e ${summary.byStatus.convocada} estão agendadas.` : ''}
          {summary.total > 0 ? ` ${summary.byType.ordinaria} são ordinárias e ${summary.byType.extraordinaria} são extraordinárias.` : ''}
          Nas próximas 30 dias, há {summary.upcoming} assembleias agendadas.
        </p>
      </div>
    </div>
  );
};

export default MeetingDashboard;