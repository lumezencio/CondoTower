import React, { useState } from 'react';
import { FinanceService } from '../services/FinanceService';
import { BillReceiveData } from '../models/BillReceive';
import { BillPayData } from '../models/BillPay';

interface FinancialReportProps {
  condominiumId: string;
}

const FinancialReport: React.FC<FinancialReportProps> = ({ condominiumId }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reportData, setReportData] = useState<{
    receivables: BillReceiveData[];
    payables: BillPayData[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const financeService = new FinanceService();

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert('Por favor, selecione as datas de início e fim do período.');
      return;
    }

    setLoading(true);
    try {
      const report = await financeService.getFinancialReport(
        condominiumId,
        new Date(startDate),
        new Date(endDate)
      );
      setReportData(report);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Ocorreu um erro ao gerar o relatório. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    // Cálculo dos totais
    const totalReceivables = reportData.receivables.reduce((sum, bill) => sum + bill.amount, 0);
    const totalPayables = reportData.payables.reduce((sum, bill) => sum + bill.amount, 0);
    const balance = totalReceivables - totalPayables;

    // Cabeçalhos do CSV
    const headers = [
      'Tipo',
      'Título',
      'Descrição',
      'Valor',
      'Data de Vencimento',
      'Status',
      'Fornecedor/Unidade',
      'Método de Pagamento'
    ];

    // Linhas para contas a receber
    const receivableRows = reportData.receivables.map(bill => [
      'Conta a Receber',
      `"${bill.title}"`,
      `"${bill.description || ''}"`,
      bill.amount,
      new Date(bill.dueDate).toISOString().split('T')[0],
      bill.status,
      bill.unitId || '-',
      bill.paymentMethod || '-'
    ]);

    // Linhas para contas a pagar
    const payableRows = reportData.payables.map(bill => [
      'Conta a Pagar',
      `"${bill.title}"`,
      `"${bill.description || ''}"`,
      bill.amount,
      new Date(bill.dueDate).toISOString().split('T')[0],
      bill.status,
      bill.supplierId || '-',
      bill.paymentMethod || '-'
    ]);

    // Linha de totais
    const totalsRow = [
      'TOTAL',
      '',
      '',
      totalReceivables - totalPayables, // Saldo
      '',
      '',
      '',
      ''
    ];

    // Linha de resumo
    const summaryRows = [
      ['RESUMO'],
      [`Total Recebido: R$ ${totalReceivables.toFixed(2)}`],
      [`Total Pago: R$ ${totalPayables.toFixed(2)}`],
      [`Saldo: R$ ${balance.toFixed(2)}`]
    ];

    // Combina tudo em uma única matriz
    const csvContent = [
      headers.join(','),
      ...receivableRows.map(row => row.join(',')),
      ...payableRows.map(row => row.join(',')),
      totalsRow.join(','),
      ...summaryRows.map(row => row[0])
    ].join('\n');

    // Criação do arquivo CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_financeiro_${startDate}_a_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Relatório Financeiro</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
              Data Início
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
              Data Fim
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </button>
          </div>
        </div>
        
        {reportData && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Período: {new Date(startDate).toLocaleDateString()} a {new Date(endDate).toLocaleDateString()}
              </h2>
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Exportar CSV
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Contas a Receber</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full leading-normal">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Título
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.receivables.map((bill) => (
                        <tr key={bill.id} className="border-b border-gray-200">
                          <td className="px-5 py-5 text-sm">{bill.title}</td>
                          <td className="px-5 py-5 text-sm">R$ {bill.amount.toFixed(2)}</td>
                          <td className="px-5 py-5 text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              bill.status === 'received' ? 'bg-green-100 text-green-800' :
                              bill.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {bill.status === 'received' ? 'Recebido' : 
                               bill.status === 'overdue' ? 'Vencido' : 'Pendente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 font-bold">
                  Total Recebido: R$ {reportData.receivables.reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Contas a Pagar</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full leading-normal">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Título
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.payables.map((bill) => (
                        <tr key={bill.id} className="border-b border-gray-200">
                          <td className="px-5 py-5 text-sm">{bill.title}</td>
                          <td className="px-5 py-5 text-sm">R$ {bill.amount.toFixed(2)}</td>
                          <td className="px-5 py-5 text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                              bill.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              bill.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {bill.status === 'paid' ? 'Pago' : 
                               bill.status === 'overdue' ? 'Vencido' :
                               bill.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 font-bold">
                  Total Pago: R$ {reportData.payables.reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Resumo Financeiro</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded shadow">
                  <p className="text-sm text-gray-600">Total Recebido</p>
                  <p className="text-xl font-bold text-green-600">
                    R$ {reportData.receivables.reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <p className="text-sm text-gray-600">Total Pago</p>
                  <p className="text-xl font-bold text-red-600">
                    R$ {reportData.payables.reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <p className="text-sm text-gray-600">Saldo</p>
                  <p className={`text-xl font-bold ${reportData.receivables.reduce((sum, bill) => sum + bill.amount, 0) - reportData.payables.reduce((sum, bill) => sum + bill.amount, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {(reportData.receivables.reduce((sum, bill) => sum + bill.amount, 0) - reportData.payables.reduce((sum, bill) => sum + bill.amount, 0)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReport;