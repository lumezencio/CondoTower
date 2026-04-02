import React, { useState, useEffect } from 'react';
import { ReportService, GeneralReportData } from '../services/ReportService';

interface ReportDashboardProps {
  condominiumId: string;
  userId: string;
}

const ReportDashboard: React.FC<ReportDashboardProps> = ({ condominiumId, userId }) => {
  const [reportData, setReportData] = useState<GeneralReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  
  const reportService = new ReportService();

  useEffect(() => {
    loadReportData();
  }, [condominiumId, userId, period]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Calcular datas com base no período selecionado
      const endDate = new Date();
      let startDate = new Date();
      
      switch(period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }
      
      const data = await reportService.generateGeneralReport(condominiumId, userId, startDate, endDate);
      setReportData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando relatório geral...</div>;
  }

  if (!reportData) {
    return <div className="text-center py-4">Nenhum dado de relatório encontrado.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard de Relatórios</h1>
        <div className="flex space-x-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
            <option value="quarter">Último Trimestre</option>
            <option value="year">Último Ano</option>
          </select>
          <button 
            onClick={loadReportData}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Atualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Finanças</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">R$ {reportData.financial.balance.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Saldo</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Comunicados</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">{reportData.communication.total}</p>
          <p className="text-sm text-gray-500 mt-1">Total</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Ocorrências</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">{reportData.occurrence.total}</p>
          <p className="text-sm text-gray-500 mt-1">Total</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Reservas</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">{reportData.reservation.total}</p>
          <p className="text-sm text-gray-500 mt-1">Total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Documentos</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-medium">{reportData.document.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Por Visibilidade</span>
              <span className="font-medium">
                {reportData.document.byVisibility.todos} Todos, 
                {reportData.document.byVisibility.conselho} Conselho, 
                {reportData.document.byVisibility.administracao} Admin
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Encomendas</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-medium">{reportData.delivery.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Aguardando Retirada</span>
              <span className="font-medium">{reportData.delivery.awaitingPickup}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Pets</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-medium">{reportData.pet.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Por Tipo</span>
              <span className="font-medium">
                {reportData.pet.byType.cao} Cães, 
                {reportData.pet.byType.gato} Gatos
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Assembleias</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-medium">{reportData.meeting.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Próximas 30 dias</span>
              <span className="font-medium">{reportData.meeting.upcoming}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-500 mb-4">Análise Geral</h3>
        <p className="text-gray-600">
          Neste período, o condomínio teve {reportData.financial.balance >= 0 ? 'um saldo positivo' : 'um saldo negativo'} de R$ {Math.abs(reportData.financial.balance).toFixed(2)}.
          Foram registradas {reportData.occurrence.total} ocorrências, com {reportData.occurrence.open} abertas e {reportData.occurrence.resolved} resolvidas.
          O condomínio conta com {reportData.pet.total} pets registrados e {reportData.delivery.total} encomendas processadas.
        </p>
      </div>
    </div>
  );
};

export default ReportDashboard;