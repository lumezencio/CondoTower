import React, { useState, useEffect } from 'react';
import { EncomendaData } from '../models/Delivery';
import { DeliveryService } from '../services/DeliveryService';

interface DeliveryFormProps {
  condominiumId: string;
  encomenda?: EncomendaData | null;
  onClose: () => void;
  onSave: () => void;
}

const DeliveryForm: React.FC<DeliveryFormProps> = ({ 
  condominiumId,
  encomenda, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Omit<EncomendaData, 'id' | 'createdAt' | 'updatedAt' | 'dataRecebimento' | 'dataRetirada'>>({
    tipo: 'outro',
    remetente: '',
    descricao: '',
    condominioId: condominiumId,
    apartamentoId: '',
    retiradoPor: undefined,
    observacoes: '',
    status: 'aguardando_retirada',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const deliveryService = new DeliveryService();

  useEffect(() => {
    if (encomenda) {
      setFormData({
        tipo: encomenda.tipo || 'outro',
        remetente: encomenda.remetente || '',
        descricao: encomenda.descricao || '',
        condominioId: encomenda.condominioId,
        apartamentoId: encomenda.apartamentoId || '',
        retiradoPor: encomenda.retiradoPor,
        observacoes: encomenda.observacoes || '',
        status: encomenda.status || 'aguardando_retirada',
      });
    }
  }, [encomenda]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.tipo) {
      newErrors.tipo = 'Tipo é obrigatório';
    }

    if (!formData.remetente.trim()) {
      newErrors.remetente = 'Remetente é obrigatório';
    } else if (formData.remetente.trim().length > 100) {
      newErrors.remetente = 'Remetente não pode ter mais de 100 caracteres';
    }

    if (!formData.apartamentoId.trim()) {
      newErrors.apartamentoId = 'Apartamento é obrigatório';
    }

    if (formData.descricao && formData.descricao.length > 500) {
      newErrors.descricao = 'Descrição não pode ter mais de 500 caracteres';
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
      if (encomenda?.id) {
        // Atualizar encomenda existente
        await deliveryService.updateEncomenda(encomenda.id, {
          ...formData,
          dataRecebimento: encomenda.dataRecebimento, // Manter a data original
        });
      } else {
        // Criar nova encomenda
        await deliveryService.createEncomenda({
          ...formData,
          dataRecebimento: new Date(),
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Erro ao salvar encomenda:', error);
      alert('Ocorreu um erro ao salvar a encomenda. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {encomenda?.id ? 'Editar Encomenda' : 'Nova Encomenda'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tipo">
              Tipo *
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="correios">Correios</option>
              <option value="sedex">SEDEX</option>
              <option value="transportadora">Transportadora</option>
              <option value="entregador">Entregador</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="remetente">
              Remetente *
            </label>
            <input
              type="text"
              id="remetente"
              name="remetente"
              value={formData.remetente}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.remetente ? 'border-red-500' : ''}`}
              placeholder="Nome do remetente"
            />
            {errors.remetente && <p className="text-red-500 text-xs italic">{errors.remetente}</p>}
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
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.descricao ? 'border-red-500' : ''}`}
              rows={3}
              placeholder="Descrição da encomenda"
            />
            {errors.descricao && <p className="text-red-500 text-xs italic">{errors.descricao}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apartamentoId">
              Apartamento *
            </label>
            <input
              type="text"
              id="apartamentoId"
              name="apartamentoId"
              value={formData.apartamentoId}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.apartamentoId ? 'border-red-500' : ''}`}
              placeholder="Número do apartamento"
            />
            {errors.apartamentoId && <p className="text-red-500 text-xs italic">{errors.apartamentoId}</p>}
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={2}
              placeholder="Observações adicionais"
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
              {loading ? 'Salvando...' : encomenda?.id ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryForm;