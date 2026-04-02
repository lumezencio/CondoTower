import React, { useState, useEffect } from 'react';
import { PetService, PetSummary } from '../services/PetService';

interface PetDashboardProps {
  moradorId: string;
}

const PetDashboard: React.FC<PetDashboardProps> = ({ moradorId }) => {
  const [summary, setSummary] = useState<PetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const petService = new PetService();

  useEffect(() => {
    loadPetSummary();
  }, [moradorId]);

  const loadPetSummary = async () => {
    try {
      const summaryData = await petService.getPetSummary(moradorId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Erro ao carregar resumo de pets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando resumo de pets...</div>;
  }

  if (!summary) {
    return <div className="text-center py-4">Nenhum dado de pets encontrado.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard de Pets</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Total de Pets</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summary.total}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Cães</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summary.byType.cao}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Gatos</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summary.byType.gato}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Porte Médio</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summary.byPorte.medio}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Pets por Tipo</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Cães</span>
              <span className="font-medium">{summary.byType.cao}</span>
            </div>
            <div className="flex justify-between">
              <span>Gatos</span>
              <span className="font-medium">{summary.byType.gato}</span>
            </div>
            <div className="flex justify-between">
              <span>Pássaros</span>
              <span className="font-medium">{summary.byType.passaro}</span>
            </div>
            <div className="flex justify-between">
              <span>Outros</span>
              <span className="font-medium">{summary.byType.outro}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500 mb-4">Pets por Porte</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Pequeno</span>
              <span className="font-medium">{summary.byPorte.pequeno}</span>
            </div>
            <div className="flex justify-between">
              <span>Médio</span>
              <span className="font-medium">{summary.byPorte.medio}</span>
            </div>
            <div className="flex justify-between">
              <span>Grande</span>
              <span className="font-medium">{summary.byPorte.grande}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-500 mb-4">Análise</h3>
        <p className="text-gray-600">
          Você tem {summary.total} pets cadastrados. 
          {summary.total > 0 ? ` Destes, ${summary.byType.cao} são cães, ${summary.byType.gato} são gatos.` : ''}
          {summary.total > 0 ? ` O porte mais comum é o ${summary.byPorte.medio > summary.byPorte.pequeno && summary.byPorte.medio > summary.byPorte.grande ? 'médio' : 
          summary.byPorte.pequeno > summary.byPorte.grande ? 'pequeno' : 'grande'}.` : ''}
        </p>
      </div>
    </div>
  );
};

export default PetDashboard;