import React, { useState, useEffect } from 'react';
import { AssembleiaData } from '../models/Meeting';
import { MeetingService } from '../services/MeetingService';

interface MeetingFormProps {
  condominiumId: string;
  assembleia?: AssembleiaData | null;
  onClose: () => void;
  onSave: () => void;
}

const MeetingForm: React.FC<MeetingFormProps> = ({ 
  condominiumId,
  assembleia, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Omit<AssembleiaData, 'id' | 'createdAt' | 'updatedAt' | 'condominioId'>>({
    tipo: 'ordinaria',
    titulo: '',
    descricao: '',
    dataAssembleia: new Date(),
    local: '',
    pauta: '',
    quorumMinimo: 50,
    status: 'convocada',
    ataUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const meetingService = new MeetingService();

  useEffect(() => {
    if (assembleia) {
      setFormData({
        tipo: assembleia.tipo || 'ordinaria',
        titulo: assembleia.titulo || '',
        descricao: assembleia.descricao || '',
        dataAssembleia: assembleia.dataAssembleia || new Date(),
        local: assembleia.local || '',
        pauta: assembleia.pauta || '',
        quorumMinimo: assembleia.quorumMinimo || 50,
        status: assembleia.status || 'convocada',
        ataUrl: assembleia.ataUrl || '',
      });
    }
  }, [assembleia]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
               name === 'dataAssembleia' ? new Date(value) : 
               name === 'quorumMinimo' ? parseInt(value) : value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    } else if (formData.titulo.trim().length > 200) {
      newErrors.titulo = 'Título não pode ter mais de 200 caracteres';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    } else if (formData.descricao.trim().length < 10) {
      newErrors.descricao = 'Descrição deve ter pelo menos 10 caracteres';
    } else if (formData.descricao.trim().length > 1000) {
      newErrors.descricao = 'Descrição não pode ter mais de 1000 caracteres';
    }

    if (!formData.local.trim()) {
      newErrors.local = 'Local é obrigatório';
    } else if (formData.local.trim().length > 100) {
      newErrors.local = 'Local não pode ter mais de 100 caracteres';
    }

    if (!formData.pauta.trim()) {
      newErrors.pauta = 'Pauta é obrigatória';
    } else if (formData.pauta.trim().length < 10) {
      newErrors.pauta = 'Pauta deve ter pelo menos 10 caracteres';
    } else if (formData.pauta.trim().length > 2000) {
      newErrors.pauta = 'Pauta não pode ter mais de 2000 caracteres';
    }

    if (formData.quorumMinimo < 0 || formData.quorumMinimo > 100) {
      newErrors.quorumMinimo = 'Quórum mínimo deve estar entre 0 e 100';
    }

    // Regra de negócio: assembleias extraordinárias exigem quórum mínimo de 25%
    if (formData.tipo === 'extraordinaria' && formData.quorumMinimo < 25) {
      newErrors.quorumMinimo = 'Assembleias extraordinárias exigem quórum mínimo de 25%';
    }

    if (formData.dataAssembleia < new Date()) {
      newErrors.dataAssembleia = 'Data da assembleia não pode ser no passado';
    }

    if (formData.ataUrl && formData.ataUrl.trim()) {
      try {
        new URL(formData.ataUrl);
      } catch (e) {
        newErrors.ataUrl = 'URL da ATA inválida';
      }
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
      if (assembleia?.id) {
        // Atualizar assembleia existente
        await meetingService.updateAssembleia(assembleia.id, {
          ...formData,
          condominioId: condominiumId,
        });
      } else {
        // Criar nova assembleia
        await meetingService.createAssembleia({
          ...formData,
          condominioId: condominiumId,
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Erro ao salvar assembleia:', error);
      alert('Ocorreu um erro ao salvar a assembleia. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {assembleia?.id ? 'Editar Assembleia' : 'Nova Assembleia'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
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
                <option value="ordinaria">Ordinária</option>
                <option value="extraordinaria">Extraordinária</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="convocada">Convocada</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="titulo">
              Título *
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.titulo ? 'border-red-500' : ''}`}
              placeholder="Título da assembleia"
            />
            {errors.titulo && <p className="text-red-500 text-xs italic">{errors.titulo}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="descricao">
              Descrição *
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.descricao ? 'border-red-500' : ''}`}
              rows={3}
              placeholder="Descrição da assembleia"
            />
            {errors.descricao && <p className="text-red-500 text-xs italic">{errors.descricao}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dataAssembleia">
                Data da Assembleia *
              </label>
              <input
                type="datetime-local"
                id="dataAssembleia"
                name="dataAssembleia"
                value={formData.dataAssembleia.toISOString().slice(0, 16)}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.dataAssembleia ? 'border-red-500' : ''}`}
              />
              {errors.dataAssembleia && <p className="text-red-500 text-xs italic">{errors.dataAssembleia}</p>}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quorumMinimo">
                Quórum Mínimo (%) *
              </label>
              <input
                type="number"
                id="quorumMinimo"
                name="quorumMinimo"
                value={formData.quorumMinimo}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.quorumMinimo ? 'border-red-500' : ''}`}
                min="0"
                max="100"
              />
              {errors.quorumMinimo && <p className="text-red-500 text-xs italic">{errors.quorumMinimo}</p>}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="local">
              Local *
            </label>
            <input
              type="text"
              id="local"
              name="local"
              value={formData.local}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.local ? 'border-red-500' : ''}`}
              placeholder="Local da assembleia"
            />
            {errors.local && <p className="text-red-500 text-xs italic">{errors.local}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pauta">
              Pauta *
            </label>
            <textarea
              id="pauta"
              name="pauta"
              value={formData.pauta}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.pauta ? 'border-red-500' : ''}`}
              rows={4}
              placeholder="Pauta da assembleia"
            />
            {errors.pauta && <p className="text-red-500 text-xs italic">{errors.pauta}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ataUrl">
              URL da ATA
            </label>
            <input
              type="text"
              id="ataUrl"
              name="ataUrl"
              value={formData.ataUrl}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.ataUrl ? 'border-red-500' : ''}`}
              placeholder="URL do documento da ATA"
            />
            {errors.ataUrl && <p className="text-red-500 text-xs italic">{errors.ataUrl}</p>}
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
              {loading ? 'Salvando...' : assembleia?.id ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingForm;