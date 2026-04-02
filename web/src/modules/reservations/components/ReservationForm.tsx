import React, { useState, useEffect } from 'react';
import { ReservaData } from '../models/Reservation';
import { ReservationService } from '../services/ReservationService';

interface ReservationFormProps {
  areaId: string;
  userId: string;
  reservationDate: string;
  onClose: () => void;
  onSave: () => void;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ 
  areaId,
  userId,
  reservationDate,
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Omit<ReservaData, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'areaComumId' | 'apartamentoId'>>({
    dataInicio: new Date(`${reservationDate}T09:00`),
    dataFim: new Date(`${reservationDate}T10:00`),
    valor: undefined,
    observacoes: '',
    motivoRejeicao: undefined,
  });

  const [areaDetails, setAreaDetails] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const reservationService = new ReservationService();

  useEffect(() => {
    loadAreaDetails();
  }, [areaId]);

  const loadAreaDetails = async () => {
    try {
      const area = await reservationService.getAreaComumById(areaId);
      setAreaDetails(area);
    } catch (error) {
      console.error('Erro ao carregar detalhes da área:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'dataInicio' || name === 'dataFim') {
      setFormData(prev => ({
        ...prev,
        [name]: new Date(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'valor' ? (value === '' ? undefined : Number(value)) : value
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.dataInicio) {
      newErrors.dataInicio = 'Data/hora de início é obrigatória';
    } else if (formData.dataInicio < new Date()) {
      newErrors.dataInicio = 'Data/hora de início não pode ser no passado';
    }

    if (!formData.dataFim) {
      newErrors.dataFim = 'Data/hora de término é obrigatória';
    } else if (formData.dataFim <= formData.dataInicio) {
      newErrors.dataFim = 'Data/hora de término deve ser posterior ao início';
    }

    // Validar se o horário está dentro das restrições da área
    if (areaDetails) {
      const durationMinutes = (formData.dataFim.getTime() - formData.dataInicio.getTime()) / (1000 * 60);
      
      if (durationMinutes < areaDetails.tempoMinReserva) {
        newErrors.dataFim = `Duração mínima é de ${areaDetails.tempoMinReserva} minutos`;
      }
      
      if (durationMinutes > areaDetails.tempoMaxReserva) {
        newErrors.dataFim = `Duração máxima é de ${areaDetails.tempoMaxReserva} minutos`;
      }
      
      // Verificar se a antecedência está dentro dos limites
      const hoursUntilStart = (formData.dataInicio.getTime() - new Date().getTime()) / (1000 * 60 * 60);
      if (hoursUntilStart < areaDetails.antecedenciaMin) {
        newErrors.dataInicio = `É necessário antecedência mínima de ${areaDetails.antecedenciaMin} horas`;
      }
      
      if (hoursUntilStart > areaDetails.antecedenciaMax) {
        newErrors.dataInicio = `O agendamento deve ser feito dentro do período máximo de ${areaDetails.antecedenciaMax} horas`;
      }
    }

    if (formData.valor !== undefined && formData.valor < 0) {
      newErrors.valor = 'Valor não pode ser negativo';
    }

    if (formData.observacoes && formData.observacoes.length > 500) {
      newErrors.observacoes = 'Observações não podem ter mais de 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await reservationService.createReserva({
        areaComumId: areaId,
        apartamentoId: userId, // Assumindo que userId seja o ID do apartamento
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        valor: formData.valor,
        observacoes: formData.observacoes,
        status: areaDetails?.requerAprovacao ? 'pendente' : 'aprovada', // Se requer aprovação, começa como pendente
      });
      
      onSave();
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
      alert('Ocorreu um erro ao salvar a reserva. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para gerar opções de tempo com intervalos de 30 minutos
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Fazer Reserva</h2>

        {areaDetails && (
          <div className="mb-4 p-3 bg-gray-100 rounded">
            <h3 className="font-bold">{areaDetails.nome}</h3>
            <p className="text-sm text-gray-600">Valor: {areaDetails.valorReserva ? `R$ ${areaDetails.valorReserva.toFixed(2)}` : 'Gratuito'}</p>
            <p className="text-sm text-gray-600">Tempo: {areaDetails.tempoMinReserva}-{areaDetails.tempoMaxReserva} min</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dataInicio">
              Data e Hora de Início *
            </label>
            <input
              type="datetime-local"
              id="dataInicio"
              name="dataInicio"
              value={formData.dataInicio.toISOString().slice(0, 16)}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.dataInicio ? 'border-red-500' : ''}`}
            />
            {errors.dataInicio && <p className="text-red-500 text-xs italic">{errors.dataInicio}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dataFim">
              Data e Hora de Término *
            </label>
            <input
              type="datetime-local"
              id="dataFim"
              name="dataFim"
              value={formData.dataFim.toISOString().slice(0, 16)}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.dataFim ? 'border-red-500' : ''}`}
            />
            {errors.dataFim && <p className="text-red-500 text-xs italic">{errors.dataFim}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="valor">
              Valor (R$)
            </label>
            <input
              type="number"
              id="valor"
              name="valor"
              value={formData.valor || ''}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.valor ? 'border-red-500' : ''}`}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            {errors.valor && <p className="text-red-500 text-xs italic">{errors.valor}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="observacoes">
              Observações
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.observacoes ? 'border-red-500' : ''}`}
              rows={3}
              placeholder="Observações adicionais"
            />
            {errors.observacoes && <p className="text-red-500 text-xs italic">{errors.observacoes}</p>}
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Fazer Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationForm;