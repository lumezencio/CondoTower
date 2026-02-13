import React, { useState, useEffect } from 'react';
import { OcorrenciaData } from '../models/Ocorrencia';
import { OccurrenceService } from '../services/OccurrenceService';

interface OccurrenceFormProps {
  condominiumId: string;
  userId: string;
  userRole?: 'admin' | 'staff' | 'resident';
  ocorrencia?: OcorrenciaData | null;
  onClose: () => void;
  onSave: () => void;
}

const OccurrenceForm: React.FC<OccurrenceFormProps> = ({ 
  condominiumId, 
  userId,
  userRole = 'resident',
  ocorrencia, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Omit<OcorrenciaData, 'id' | 'createdAt' | 'updatedAt' | 'dataAbertura' | 'dataResolucao'>>({
    tipo: 'outro',
    titulo: '',
    descricao: '',
    status: ocorrencia?.id ? ocorrencia.status : 'aberta',
    prioridade: 'media',
    local: '',
    anexos: [],
    autorId: userId,
    responsavelId: userRole === 'admin' || userRole === 'staff' ? userId : undefined,
    condominioId: condominiumId,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const occurrenceService = new OccurrenceService();

  useEffect(() => {
    if (ocorrencia) {
      setFormData({
        tipo: ocorrencia.tipo || 'outro',
        titulo: ocorrencia.titulo || '',
        descricao: ocorrencia.descricao || '',
        status: ocorrencia.status || 'aberta',
        prioridade: ocorrencia.prioridade || 'media',
        local: ocorrencia.local || '',
        anexos: ocorrencia.anexos || [],
        autorId: ocorrencia.autorId,
        responsavelId: ocorrencia.responsavelId,
        condominioId: ocorrencia.condominioId,
      });
    }
  }, [ocorrencia]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.tipo) {
      newErrors.tipo = 'Tipo é obrigatório';
    }

    if (!formData.prioridade) {
      newErrors.prioridade = 'Prioridade é obrigatória';
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
      if (ocorrencia?.id) {
        // Atualizar ocorrência existente
        await occurrenceService.updateOcorrencia(ocorrencia.id, formData);
      } else {
        // Criar nova ocorrência
        await occurrenceService.createOcorrencia({
          ...formData,
          dataAbertura: new Date(),
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Erro ao salvar ocorrência:', error);
      alert('Ocorreu um erro ao salvar a ocorrência. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {ocorrencia?.id ? 'Editar Ocorrência' : 'Nova Ocorrência'}
        </h2>

        <form onSubmit={handleSubmit}>
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
              placeholder="Título da ocorrência"
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
              rows={4}
              placeholder="Descrição detalhada da ocorrência"
            />
            {errors.descricao && <p className="text-red-500 text-xs italic">{errors.descricao}</p>}
          </div>

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
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.tipo ? 'border-red-500' : ''}`}
              >
                <option value="manutencao">Manutenção</option>
                <option value="seguranca">Segurança</option>
                <option value="limpeza">Limpeza</option>
                <option value="vizinhanca">Vizinhança</option>
                <option value="elevador">Elevador</option>
                <option value="piscina">Piscina</option>
                <option value="barulho">Barulho</option>
                <option value="outro">Outro</option>
              </select>
              {errors.tipo && <p className="text-red-500 text-xs italic">{errors.tipo}</p>}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="prioridade">
                Prioridade *
              </label>
              <select
                id="prioridade"
                name="prioridade"
                value={formData.prioridade}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.prioridade ? 'border-red-500' : ''}`}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
              {errors.prioridade && <p className="text-red-500 text-xs italic">{errors.prioridade}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="local">
                Local
              </label>
              <input
                type="text"
                id="local"
                name="local"
                value={formData.local}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Local onde ocorreu"
              />
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
                disabled={!(userRole === 'admin' || userRole === 'staff')}
              >
                <option value="aberta">Aberta</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="resolvida">Resolvida</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="anexos">
              Anexos (URLs separadas por vírgula)
            </label>
            <input
              type="text"
              id="anexos"
              name="anexos"
              value={formData.anexos?.join(', ') || ''}
              onChange={(e) => {
                const urls = e.target.value.split(',').map(url => url.trim()).filter(url => url);
                setFormData(prev => ({ ...prev, anexos: urls }));
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="https://exemplo.com/foto1.jpg, https://exemplo.com/foto2.png"
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
              {loading ? 'Salvando...' : ocorrencia?.id ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OccurrenceForm;