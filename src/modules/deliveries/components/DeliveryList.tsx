import React, { useState, useEffect } from 'react';
import { DeliveryService } from '../services/DeliveryService';
import { EncomendaData } from '../models/Delivery';

interface DeliveryListProps {
  condominiumId: string;
  userId: string;
  userRole?: 'admin' | 'resident' | 'staff';
}

const DeliveryList: React.FC<DeliveryListProps> = ({ condominiumId, userId, userRole = 'resident' }) => {
  const [encomendas, setEncomendas] = useState<EncomendaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEncomenda, setEditingEncomenda] = useState<EncomendaData | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  
  const deliveryService = new DeliveryService();

  useEffect(() => {
    loadEncomendas();
  }, [condominiumId, selectedStatus, selectedType, userRole, userId]);

  const loadEncomendas = async () => {
    try {
      let filters: any = {};
      
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }
      
      if (selectedType !== 'all') {
        filters.tipo = selectedType;
      }
      
      let encomendasData: EncomendaData[];
      
      if (userRole === 'admin' || userRole === 'staff') {
        encomendasData = await deliveryService.getAllEncomendas(condominiumId, filters);
      } else {
        // Residentes só veem suas próprias encomendas
        encomendasData = await deliveryService.getEncomendasByApartment(userId);
      }
      
      setEncomendas(encomendasData);
    } catch (error) {
      console.error('Erro ao carregar encomendas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta encomenda?')) {
      try {
        await deliveryService.deleteEncomenda(id);
        loadEncomendas();
      } catch (error) {
        console.error('Erro ao excluir encomenda:', error);
      }
    }
  };

  const handleMarkAsRetirada = async (id: string) => {
    const retiradoPor = prompt('Informe quem retirou a encomenda:');
    if (retiradoPor) {
      try {
        await deliveryService.markEncomendaAsRetirada(id, retiradoPor);
        loadEncomendas();
      } catch (error) {
        console.error('Erro ao marcar encomenda como retirada:', error);
      }
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const getStatusLabel = (status: string): string => {
    switch(status) {
      case 'aguardando_retirada': return 'Aguardando Retirada';
      case 'retirada': return 'Retirada';
      case 'entregue': return 'Entregue';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'aguardando_retirada': return 'bg-yellow-100 text-yellow-800';
      case 'retirada': return 'bg-green-100 text-green-800';
      case 'entregue': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string): string => {
    switch(type) {
      case 'correios': return 'Correios';
      case 'sedex': return 'SEDEX';
      case 'transportadora': return 'Transportadora';
      case 'entregador': return 'Entregador';
      case 'outro': return 'Outro';
      default: return type;
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando encomendas...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-800">Encomendas</h1>
        {(userRole === 'admin' || userRole === 'staff') && (
          <button 
            onClick={() => {
              setEditingEncomenda(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Nova Encomenda
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="w-full md:w-1/2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="all">Todos os status</option>
            <option value="aguardando_retirada">Aguardando Retirada</option>
            <option value="retirada">Retirada</option>
            <option value="entregue">Entregue</option>
          </select>
        </div>
        <div className="w-full md:w-1/2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="all">Todos os tipos</option>
            <option value="correios">Correios</option>
            <option value="sedex">SEDEX</option>
            <option value="transportadora">Transportadora</option>
            <option value="entregador">Entregador</option>
            <option value="outro">Outro</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Remetente
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Apartamento
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Data Recebimento
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {encomendas.length > 0 ? (
              encomendas.map((encomenda) => (
                <tr key={encomenda.id} className="border-b border-gray-200">
                  <td className="px-5 py-5 text-sm">
                    <div className="font-medium text-gray-900">{encomenda.remetente}</div>
                    {encomenda.descricao && (
                      <div className="text-gray-600 text-xs mt-1">{encomenda.descricao}</div>
                    )}
                  </td>
                  <td className="px-5 py-5 text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      {getTypeLabel(encomenda.tipo)}
                    </span>
                  </td>
                  <td className="px-5 py-5 text-sm">
                    {encomenda.apartamentoId}
                  </td>
                  <td className="px-5 py-5 text-sm">
                    {formatDate(encomenda.dataRecebimento)}
                  </td>
                  <td className="px-5 py-5 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(encomenda.status)}`}>
                      {getStatusLabel(encomenda.status)}
                    </span>
                  </td>
                  <td className="px-5 py-5 text-sm">
                    <div className="flex space-x-2">
                      {(userRole === 'admin' || userRole === 'staff') && encomenda.status === 'aguardando_retirada' && (
                        <button
                          onClick={() => handleMarkAsRetirada(encomenda.id!)}
                          className="text-green-600 hover:text-green-900"
                          title="Marcar como Retirada"
                        >
                          Marcar Retirada
                        </button>
                      )}
                      {(userRole === 'admin' || userRole === 'staff') && (
                        <>
                          <button
                            onClick={() => {
                              setEditingEncomenda(encomenda);
                              setShowForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(encomenda.id!)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            Excluir
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-5 text-sm text-center text-gray-500">
                  Nenhuma encomenda encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para formulário */}
      {showForm && (userRole === 'admin' || userRole === 'staff') && (
        <DeliveryForm
          condominiumId={condominiumId}
          encomenda={editingEncomenda}
          onClose={() => {
            setShowForm(false);
            setEditingEncomenda(null);
          }}
          onSave={() => {
            loadEncomendas();
            setShowForm(false);
            setEditingEncomenda(null);
          }}
        />
      )}
    </div>
  );
};

export default DeliveryList;