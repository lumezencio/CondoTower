import React, { useState } from 'react';
import { ReportService } from '../services/ReportService';

interface ReportGeneratorProps {
  condominiumId: string;
  userId: string;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ condominiumId, userId }) => {
  const [reportType, setReportType] = useState<string>('general');
  const [periodStart, setPeriodStart] = useState<string>(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [periodEnd, setPeriodEnd] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  
  const reportService = new ReportService();

  const handleGenerateReport = async () => {
    setLoading(true);
    setGeneratedReport(null);
    
    try {
      const startDate = new Date(periodStart);
      const endDate = new Date(periodEnd);
      
      let reportData: any;
      
      switch(reportType) {
        case 'financial':
          reportData = await reportService.generateFinancialReport(condominiumId, startDate, endDate);
          break;
        case 'communication':
          reportData = await reportService.generateCommunicationReport(condominiumId, userId, startDate, endDate);
          break;
        case 'document':
          reportData = await reportService.generateDocumentReport(condominiumId, startDate, endDate);
          break;
        case 'occurrence':
          reportData = await reportService.generateOccurrenceReport(condominiumId, startDate, endDate);
          break;
        case 'reservation':
          reportData = await reportService.generateReservationReport(condominiumId, startDate, endDate);
          break;
        case 'delivery':
          reportData = await reportService.generateDeliveryReport(condominiumId, startDate, endDate);
          break;
        case 'pet':
          reportData = await reportService.generatePetReport(condominiumId, startDate, endDate);
          break;
        case 'meeting':
          reportData = await reportService.generateMeetingReport(condominiumId, startDate, endDate);
          break;
        case 'general':
        default:
          reportData = await reportService.generateGeneralReport(condominiumId, userId, startDate, endDate);
          break;
      }
      
      setGeneratedReport(reportData);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Ocorreu um erro ao gerar o relatório. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!generatedReport) {
      alert('Nenhum relatório gerado para exportar');
      return;
    }
    
    try {
      const blob = await reportService.exportReport(generatedReport, format);
      
      // Criar link para download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('Ocorreu um erro ao exportar o relatório. Por favor, tente novamente.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gerador de Relatórios</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reportType">
              Tipo de Relatório
            </label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="general">Geral</option>
              <option value="financial">Financeiro</option>
              <option value="communication">Comunicados</option>
              <option value="document">Documentos</option>
              <option value="occurrence">Ocorrências</option>
              <option value="reservation">Reservas</option>
              <option value="delivery">Encomendas</option>
              <option value="pet">Pets</option>
              <option value="meeting">Assembleias</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="periodStart">
              Data Início
            </label>
            <input
              type="date"
              id="periodStart"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="periodEnd">
              Data Fim
            </label>
            <input
              type="date"
              id="periodEnd"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </button>
          </div>
        </div>
        
        {generatedReport && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Relatório Gerado</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExport('pdf')}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Exportar PDF
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Exportar Excel
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Exportar CSV
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <pre className="whitespace-pre-wrap break-words text-sm">
                {JSON.stringify(generatedReport, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportGenerator;