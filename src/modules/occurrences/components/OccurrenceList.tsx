import React, { useState, useEffect } from 'react';
import { OccurrenceService } from '../services/OccurrenceService';
import { OcorrenciaData } from '../models/Ocorrencia';

interface OccurrenceListProps {
  condominiumId: string;
  userId: string;
  userRole?: 'admin' | 'staff' | 'resident';
}

const OccurrenceList: React.FC<OccurrenceListProps> = ({ condominiumId, userId, userRole = 'resident' }) => {
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOcorrencia, setEditingOcorrencia] = useState<OcorrenciaData | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  
  const occurrenceService = new OccurrenceService();

  useEffect(() => {
    loadOcorrencias();
  }, [condominiumId, selectedStatus, selectedType]);

  const loadOcorrencias = async () => {
    try {
      let filters: any = {};
      
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }
      
      if (selectedType !== 'all') {
        filters.tipo = selectedType;
      }
      
      // Dependendo do papel do usuário, pode ser necessário filtrar as ocorrências
      if (userRole === 'resident') {
        // Residentes só veem suas próprias ocorrências
        filters.autorId = userId;
      }
      
      const ocorrenciasData = await occurrenceService.getAllOcorrencias(condominiumId, filters);
      setOcorrencias(ocorrenciasData);
    } catch (error) {
      console.error('Erro ao carregar ocorrências:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta ocorrência? Esta ação não pode ser desfeita.')) {
      try {
        await occurrenceService.deleteOcorrencia(id);
        loadOcorrencias();
      } catch (error) {
        console.error('Erro ao excluir ocorrência:', error);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await occurrenceService.changeOcorrenciaStatus(id, newStatus);
      loadOcorrencias();
    } catch (error) {
      console.error('Erro ao alterar status da ocorrência:', error);
    }
  };

  const getTypeLabel = (type: string): string => {
    switch(type) {
      case 'manutencao': return 'Manutenção';
      case 'seguranca': return 'Segurança';
      case 'limpeza': return 'Limpeza';
      case 'vizinhanca': return 'Vizinhança';
      case 'elevador': return 'Elevador';
      case 'piscina': return 'Piscina';
      case 'barulho': return 'Barulho';
      case 'outro': return 'Outro';
      default: return type;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch(status) {
      case 'aberta': return 'Aberta';
      case 'em_andamento': return 'Em Andamento';
      case 'resolvida': return 'Resolvida';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'aberta': return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'resolvida': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch(priority) {
      case 'baixa': return 'bg-green-100 text-green-800';
      case 'media': return 'bg-blue-100 text-blue-800';
      case 'alta': return 'bg-yellow-100 text-yellow-800';
      case 'urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando ocorrências...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-800">Ocorrências do Condomínio</h1>
        <button 
          onClick={() => {
            setEditingOcorrencia(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Nova Ocorrência
        </button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="w-full md:w-1/2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="all">Todos os status</option>
            <option value="aberta">Aberta</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="resolvida">Resolvida</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <div className="w-full md:w-1/2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="all">Todos os tipos</option>
            <option value="manutencao">Manutenção</option>
            <option value="seguranca">Segurança</option>
            <option value="limpeza">Limpeza</option>
            <option value="vizinhanca">Vizinhança</option>
            <option value="elevador">Elevador</option>
            <option value="piscina">Piscina</option>
            <option value="barulho">Barulho</option>
            <option value="outro">Outro</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Título
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Prioridade
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Data Abertura
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {ocorrencias.length > 0 ? (
              ocorrencias.map((ocorrencia) => (
                <tr key={ocorrencia.id} className="border-b border-gray-200">
                  <td className="px-5 py-5 text-sm">
                    <div>
                      <div className="font-medium text-gray-900">{ocorrencia.titulo}</div>
                      <div className="text-gray-600 text-xs mt-1">{ocorrencia.descricao.substring(0, 50)}{ocorrencia.descricao.length > 50 ? '...' : ''}</div>
                    </div>
                  </td>
                  <td className="px-5 py-5 text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      {getTypeLabel(ocorrencia.tipo)}
                    </span>
                  </td>
                  <td className="px-5 py-5 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ocorrencia.prioridade)}`}>
                      {ocorrencia.prioridade.charAt(0).toUpperCase() + ocorrencia.prioridade.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-5 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ocorrencia.status)}`}>
                      {getStatusLabel(ocorrencia.status)}
                    </span>
                  </td>
                  <td className="px-5 py-5 text-sm">
                    {new Date(ocorrencia.dataAbertura).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-5 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingOcorrencia(ocorrencia);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver Detalhes/Editar"
                      >
                        Ver
                      </button>
                      {(userRole === 'admin' || userRole === 'staff') && ocorrencia.status !== 'resolvida' && (
                        <select
                          value={ocorrencia.status}
                          onChange={(e) => handleStatusChange(ocorrencia.id!, e.target.value)}
                          className="text-xs border rounded px-1 py-0.5"
                        >
                          <option value="aberta">Aberta</option>
                          <option value="em_andamento">Em Andamento</option>
                          <option value="resolvida">Resolvida</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      )}
                      {(userRole === 'admin' || ocorrencia.autorId === userId) && ocorrencia.status === 'aberta' && (
                        <button
                          onClick={() => handleDelete(ocorrencia.id!)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-5 text-sm text-center text-gray-500">
                  Nenhuma ocorrência encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para formulário */}
      {showForm && (
        <OccurrenceForm
          condominiumId={condominiumId}
          userId={userId}
          userRole={userRole}
          ocorrencia={editingOcorrencia}
          onClose={() => {
            setShowForm(false);
            setEditingOcorrencia(null);
          }}
          onSave={() => {
            loadOcorrencias();
            setShowForm(false);
            setEditingOcorrencia(null);
          }}
        />
      )}
    </div>
  );
};

export default OccurrenceList;