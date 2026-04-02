import React, { useState, useEffect } from 'react';
import { ReservationService } from '../services/ReservationService';
import { AreaComumData, ReservaData } from '../models/Reservation';

interface ReservationListProps {
  condominiumId: string;
  userId: string;
  userRole?: 'admin' | 'resident';
}

const ReservationList: React.FC<ReservationListProps> = ({ condominiumId, userId, userRole = 'resident' }) => {
  const [areasComuns, setAreasComuns] = useState<AreaComumData[]>([]);
  const [reservas, setReservas] = useState<ReservaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaComumData | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [reservationDate, setReservationDate] = useState<string>('');
  
  const reservationService = new ReservationService();

  useEffect(() => {
    loadAreasComuns();
    loadReservas();
  }, [condominiumId]);

  const loadAreasComuns = async () => {
    try {
      const areasData = await reservationService.getAllAreasComuns(condominiumId);
      setAreasComuns(areasData);
    } catch (error) {
      console.error('Erro ao carregar áreas comuns:', error);
    }
  };

  const loadReservas = async () => {
    try {
      let reservasData: ReservaData[];
      
      if (userRole === 'admin') {
        reservasData = await reservationService.getReservasByCondominium(condominiumId);
      } else {
        reservasData = await reservationService.getReservasByApartamento(userId);
      }
      
      setReservas(reservasData);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArea = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta área comum?')) {
      try {
        await reservationService.deleteAreaComum(id);
        loadAreasComuns();
      } catch (error) {
        console.error('Erro ao excluir área comum:', error);
      }
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      try {
        await reservationService.changeReservaStatus(id, 'cancelada');
        loadReservas();
      } catch (error) {
        console.error('Erro ao cancelar reserva:', error);
      }
    }
  };

  const handleApproveReservation = async (id: string) => {
    try {
      await reservationService.changeReservaStatus(id, 'aprovada');
      loadReservas();
    } catch (error) {
      console.error('Erro ao aprovar reserva:', error);
    }
  };

  const handleRejectReservation = async (id: string) => {
    try {
      await reservationService.changeReservaStatus(id, 'rejeitada', 'Recusada pelo administrador');
      loadReservas();
    } catch (error) {
      console.error('Erro ao rejeitar reserva:', error);
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const getStatusLabel = (status: string): string => {
    switch(status) {
      case 'pendente': return 'Pendente';
      case 'aprovada': return 'Aprovada';
      case 'rejeitada': return 'Rejeitada';
      case 'cancelada': return 'Cancelada';
      case 'concluida': return 'Concluída';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'aprovada': return 'bg-green-100 text-green-800';
      case 'rejeitada': return 'bg-red-100 text-red-800';
      case 'cancelada': return 'bg-gray-100 text-gray-800';
      case 'concluida': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando áreas comuns e reservas...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-800">Reservas de Áreas Comuns</h1>
        {userRole === 'admin' && (
          <button 
            onClick={() => {
              setEditingArea(null);
              setShowAreaForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Nova Área Comum
          </button>
        )}
      </div>

      {/* Lista de Áreas Comuns */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Áreas Comuns Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {areasComuns.map((area) => (
            <div key={area.id} className="bg-white shadow rounded-lg p-4 border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{area.nome}</h3>
                  <p className="text-gray-600 text-sm mt-1">{area.descricao}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Capacidade: {area.capacidade ? `${area.capacidade} pessoas` : 'Não especificada'}</p>
                    <p>Valor: {area.valorReserva ? `R$ ${area.valorReserva.toFixed(2)}` : 'Gratuito'}</p>
                  </div>
                </div>
                {userRole === 'admin' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingArea(area);
                        setShowAreaForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteArea(area.id!)}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-3">
                <button
                  onClick={() => {
                    setSelectedArea(area.id!);
                    setReservationDate(new Date().toISOString().split('T')[0]);
                    setShowReservationForm(true);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  Fazer Reserva
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de Reservas */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Minhas Reservas</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Área
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {reservas.length > 0 ? (
                reservas.map((reserva) => {
                  const area = areasComuns.find(a => a.id === reserva.areaComumId);
                  return (
                    <tr key={reserva.id} className="border-b border-gray-200">
                      <td className="px-5 py-5 text-sm">
                        <div className="font-medium text-gray-900">{area?.nome || 'Área desconhecida'}</div>
                      </td>
                      <td className="px-5 py-5 text-sm">
                        {formatDate(reserva.dataInicio)} - {formatDate(reserva.dataFim)}
                      </td>
                      <td className="px-5 py-5 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reserva.status)}`}>
                          {getStatusLabel(reserva.status)}
                        </span>
                      </td>
                      <td className="px-5 py-5 text-sm">
                        {reserva.valor ? `R$ ${reserva.valor.toFixed(2)}` : 'Gratuito'}
                      </td>
                      <td className="px-5 py-5 text-sm">
                        <div className="flex space-x-2">
                          {(userRole === 'admin' && reserva.status === 'pendente') && (
                            <>
                              <button
                                onClick={() => handleApproveReservation(reserva.id!)}
                                className="text-green-600 hover:text-green-900"
                                title="Aprovar"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => handleRejectReservation(reserva.id!)}
                                className="text-red-600 hover:text-red-900"
                                title="Rejeitar"
                              >
                                ✗
                              </button>
                            </>
                          )}
                          {(reserva.status === 'pendente' || reserva.status === 'aprovada') && (
                            <button
                              onClick={() => handleDeleteReservation(reserva.id!)}
                              className="text-red-600 hover:text-red-900"
                              title="Cancelar"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-5 text-sm text-center text-gray-500">
                    Nenhuma reserva encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para formulário de área comum */}
      {showAreaForm && userRole === 'admin' && (
        <AreaCommonForm
          condominiumId={condominiumId}
          area={editingArea}
          onClose={() => {
            setShowAreaForm(false);
            setEditingArea(null);
          }}
          onSave={() => {
            loadAreasComuns();
            setShowAreaForm(false);
            setEditingArea(null);
          }}
        />
      )}

      {/* Modal para formulário de reserva */}
      {showReservationForm && selectedArea && (
        <ReservationForm
          areaId={selectedArea}
          userId={userId}
          reservationDate={reservationDate}
          onClose={() => {
            setShowReservationForm(false);
            setSelectedArea(null);
          }}
          onSave={() => {
            loadReservas();
            setShowReservationForm(false);
            setSelectedArea(null);
          }}
        />
      )}
    </div>
  );
};

export default ReservationList;