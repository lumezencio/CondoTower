import React, { useState, useEffect } from 'react';
import { FinanceService, FinancialSummary } from '../services/FinanceService';

interface FinancialDashboardProps {
  condominiumId: string;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ condominiumId }) => {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const financeService = new FinanceService();

  useEffect(() => {
    loadFinancialSummary();
  }, [condominiumId]);

  const loadFinancialSummary = async () => {
    try {
      const summaryData = await financeService.getFinancialSummary(condominiumId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Erro ao carregar resumo financeiro:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando resumo financeiro...</div>;
  }

  if (!summary) {
    return <div className="text-center py-4">Nenhum dado financeiro encontrado.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Financeiro</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Total a Receber</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">R$ {summary.totalReceivable.toFixed(2)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Total Recebido</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">R$ {summary.totalReceived.toFixed(2)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Total a Pagar</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">R$ {summary.totalPayable.toFixed(2)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Total Pago</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">R$ {summary.totalPaid.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Saldo Financeiro</h3>
          <p className={`mt-2 text-3xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {summary.balance.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Contas Vencidas</h3>
          <div className="mt-2">
            <p className="text-xl font-bold text-red-600">{summary.overdueReceivables} a receber</p>
            <p className="text-xl font-bold text-red-600">{summary.overduePayables} a pagar</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-500 mb-4">Relação de Contas</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700">Contas a Receber</h4>
            <p className="text-gray-600">
              Total: {summary.totalReceivable > 0 ? (summary.totalReceived / summary.totalReceivable * 100).toFixed(2) : '0'}% recebido
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${summary.totalReceivable > 0 ? (summary.totalReceived / summary.totalReceivable * 100) : 0}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700">Contas a Pagar</h4>
            <p className="text-gray-600">
              Total: {summary.totalPayable > 0 ? (summary.totalPaid / summary.totalPayable * 100).toFixed(2) : '0'}% pago
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${summary.totalPayable > 0 ? (summary.totalPaid / summary.totalPayable * 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;