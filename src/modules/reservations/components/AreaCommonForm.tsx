import React, { useState, useEffect } from 'react';
import { AreaComumData } from '../models/Reservation';
import { ReservationService } from '../services/ReservationService';

interface AreaCommonFormProps {
  condominiumId: string;
  area?: AreaComumData | null;
  onClose: () => void;
  onSave: () => void;
}

const AreaCommonForm: React.FC<AreaCommonFormProps> = ({ 
  condominiumId,
  area, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Omit<AreaComumData, 'id' | 'createdAt' | 'updatedAt' | 'condominioId'>>({
    nome: '',
    descricao: '',
    capacidade: undefined,
    valorReserva: undefined,
    tempoMinReserva: 60, // 1 hora em minutos
    tempoMaxReserva: 240, // 4 horas em minutos
    antecedenciaMin: 24, // 24 horas
    antecedenciaMax: 168, // 7 dias em horas
    requerAprovacao: true,
    ativo: true,
    regras: '',
    fotos: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const reservationService = new ReservationService();

  useEffect(() => {
    if (area) {
      setFormData({
        nome: area.nome || '',
        descricao: area.descricao || '',
        capacidade: area.capacidade,
        valorReserva: area.valorReserva,
        tempoMinReserva: area.tempoMinReserva || 60,
        tempoMaxReserva: area.tempoMaxReserva || 240,
        antecedenciaMin: area.antecedenciaMin || 24,
        antecedenciaMax: area.antecedenciaMax || 168,
        requerAprovacao: area.requerAprovacao || true,
        ativo: area.ativo || true,
        regras: area.regras || '',
        fotos: area.fotos || [],
      });
    }
  }, [area]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
               name === 'capacidade' || name === 'valorReserva' || name === 'tempoMinReserva' || 
               name === 'tempoMaxReserva' || name === 'antecedenciaMin' || name === 'antecedenciaMax' ?
               value === '' ? undefined : Number(value) : value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length > 100) {
      newErrors.nome = 'Nome não pode ter mais de 100 caracteres';
    }

    if (formData.descricao && formData.descricao.length > 500) {
      newErrors.descricao = 'Descrição não pode ter mais de 500 caracteres';
    }

    if (formData.capacidade !== undefined && formData.capacidade <= 0) {
      newErrors.capacidade = 'Capacidade deve ser maior que zero';
    }

    if (formData.valorReserva !== undefined && formData.valorReserva < 0) {
      newErrors.valorReserva = 'Valor da reserva não pode ser negativo';
    }

    if (formData.tempoMinReserva <= 0) {
      newErrors.tempoMinReserva = 'Tempo mínimo de reserva deve ser maior que zero';
    }

    if (formData.tempoMaxReserva < formData.tempoMinReserva) {
      newErrors.tempoMaxReserva = 'Tempo máximo deve ser maior ou igual ao tempo mínimo';
    }

    if (formData.antecedenciaMin < 0) {
      newErrors.antecedenciaMin = 'Antecedência mínima não pode ser negativa';
    }

    if (formData.antecedenciaMax < formData.antecedenciaMin) {
      newErrors.antecedenciaMax = 'Antecedência máxima deve ser maior ou igual à mínima';
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
      if (area?.id) {
        // Atualizar área existente
        await reservationService.updateAreaComum(area.id, {
          ...formData,
          condominioId: condominiumId,
        });
      } else {
        // Criar nova área
        await reservationService.createAreaComum({
          ...formData,
          condominioId: condominiumId,
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Erro ao salvar área comum:', error);
      alert('Ocorreu um erro ao salvar a área comum. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {area?.id ? 'Editar Área Comum' : 'Nova Área Comum'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nome">
              Nome *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.nome ? 'border-red-500' : ''}`}
              placeholder="Nome da área comum"
            />
            {errors.nome && <p className="text-red-500 text-xs italic">{errors.nome}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="descricao">
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={3}
              placeholder="Descrição da área comum"
            />
            {errors.descricao && <p className="text-red-500 text-xs italic">{errors.descricao}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="capacidade">
                Capacidade
              </label>
              <input
                type="number"
                id="capacidade"
                name="capacidade"
                value={formData.capacidade || ''}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.capacidade ? 'border-red-500' : ''}`}
                placeholder="Capacidade máxima"
                min="1"
              />
              {errors.capacidade && <p className="text-red-500 text-xs italic">{errors.capacidade}</p>}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="valorReserva">
                Valor da Reserva (R$)
              </label>
              <input
                type="number"
                id="valorReserva"
                name="valorReserva"
                value={formData.valorReserva || ''}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.valorReserva ? 'border-red-500' : ''}`}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.valorReserva && <p className="text-red-500 text-xs italic">{errors.valorReserva}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tempoMinReserva">
                Tempo Mínimo de Reserva (min)
              </label>
              <input
                type="number"
                id="tempoMinReserva"
                name="tempoMinReserva"
                value={formData.tempoMinReserva}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.tempoMinReserva ? 'border-red-500' : ''}`}
                min="15"
                step="15"
              />
              {errors.tempoMinReserva && <p className="text-red-500 text-xs italic">{errors.tempoMinReserva}</p>}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tempoMaxReserva">
                Tempo Máximo de Reserva (min)
              </label>
              <input
                type="number"
                id="tempoMaxReserva"
                name="tempoMaxReserva"
                value={formData.tempoMaxReserva}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.tempoMaxReserva ? 'border-red-500' : ''}`}
                min="15"
                step="15"
              />
              {errors.tempoMaxReserva && <p className="text-red-500 text-xs italic">{errors.tempoMaxReserva}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="antecedenciaMin">
                Antecedência Mínima (horas)
              </label>
              <input
                type="number"
                id="antecedenciaMin"
                name="antecedenciaMin"
                value={formData.antecedenciaMin}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.antecedenciaMin ? 'border-red-500' : ''}`}
                min="0"
              />
              {errors.antecedenciaMin && <p className="text-red-500 text-xs italic">{errors.antecedenciaMin}</p>}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="antecedenciaMax">
                Antecedência Máxima (horas)
              </label>
              <input
                type="number"
                id="antecedenciaMax"
                name="antecedenciaMax"
                value={formData.antecedenciaMax}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.antecedenciaMax ? 'border-red-500' : ''}`}
                min="0"
              />
              {errors.antecedenciaMax && <p className="text-red-500 text-xs italic">{errors.antecedenciaMax}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="requerAprovacao"
                  checked={formData.requerAprovacao}
                  onChange={handleChange}
                  className="mr-2 leading-tight"
                />
                <span className="text-sm text-gray-700">Requer aprovação</span>
              </label>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="ativo"
                  checked={formData.ativo}
                  onChange={handleChange}
                  className="mr-2 leading-tight"
                />
                <span className="text-sm text-gray-700">Ativo</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regras">
              Regras
            </label>
            <textarea
              id="regras"
              name="regras"
              value={formData.regras}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={3}
              placeholder="Regras da área comum"
            />
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
              {loading ? 'Salvando...' : area?.id ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AreaCommonForm;