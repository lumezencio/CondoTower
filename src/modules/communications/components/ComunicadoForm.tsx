import React, { useState, useEffect } from 'react';
import { ComunicadoData } from '../models/Comunicado';
import { CommunicationService } from '../services/CommunicationService';

interface ComunicadoFormProps {
  condominiumId: string;
  userId: string;
  comunicado?: ComunicadoData | null;
  onClose: () => void;
  onSave: () => void;
}

const ComunicadoForm: React.FC<ComunicadoFormProps> = ({ 
  condominiumId, 
  userId,
  comunicado, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Omit<ComunicadoData, 'id' | 'createdAt' | 'updatedAt' | 'dataPublicacao'>>({
    titulo: '',
    conteudo: '',
    tipo: 'aviso_geral',
    prioridade: 'normal',
    fixado: false,
    anexos: [],
    autorId: userId,
    condominioId: condominiumId,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const communicationService = new CommunicationService();

  useEffect(() => {
    if (comunicado) {
      setFormData({
        titulo: comunicado.titulo || '',
        conteudo: comunicado.conteudo || '',
        tipo: comunicado.tipo || 'aviso_geral',
        prioridade: comunicado.prioridade || 'normal',
        fixado: comunicado.fixado || false,
        anexos: comunicado.anexos || [],
        autorId: comunicado.autorId,
        condominioId: comunicado.condominioId,
      });
    }
  }, [comunicado]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    } else if (formData.titulo.trim().length > 200) {
      newErrors.titulo = 'Título não pode ter mais de 200 caracteres';
    }

    if (!formData.conteudo.trim()) {
      newErrors.conteudo = 'Conteúdo é obrigatório';
    } else if (formData.conteudo.trim().length < 10) {
      newErrors.conteudo = 'Conteúdo deve ter pelo menos 10 caracteres';
    } else if (formData.conteudo.trim().length > 5000) {
      newErrors.conteudo = 'Conteúdo não pode ter mais de 5000 caracteres';
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
      if (comunicado?.id) {
        // Atualizar comunicado existente
        await communicationService.updateComunicado(comunicado.id, formData);
      } else {
        // Criar novo comunicado
        await communicationService.createComunicado({
          ...formData,
          autorId: userId,
          condominioId: condominiumId,
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Erro ao salvar comunicado:', error);
      alert('Ocorreu um erro ao salvar o comunicado. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {comunicado?.id ? 'Editar Comunicado' : 'Novo Comunicado'}
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
              placeholder="Título do comunicado"
            />
            {errors.titulo && <p className="text-red-500 text-xs italic">{errors.titulo}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="conteudo">
              Conteúdo *
            </label>
            <textarea
              id="conteudo"
              name="conteudo"
              value={formData.conteudo}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.conteudo ? 'border-red-500' : ''}`}
              rows={6}
              placeholder="Conteúdo do comunicado"
            />
            {errors.conteudo && <p className="text-red-500 text-xs italic">{errors.conteudo}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tipo">
                Tipo
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="aviso_geral">Aviso Geral</option>
                <option value="manutencao">Manutenção</option>
                <option value="assembleia">Assembleia</option>
                <option value="evento">Evento</option>
                <option value="seguranca">Segurança</option>
                <option value="regra">Regra</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="prioridade">
                Prioridade
              </label>
              <select
                id="prioridade"
                name="prioridade"
                value={formData.prioridade}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
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
              placeholder="https://exemplo.com/anexo1.pdf, https://exemplo.com/anexo2.jpg"
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="fixado"
                checked={formData.fixado}
                onChange={handleChange}
                className="mr-2 leading-tight"
              />
              <span className="text-sm text-gray-700">Fixar este comunicado</span>
            </label>
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
              {loading ? 'Salvando...' : comunicado?.id ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComunicadoForm;