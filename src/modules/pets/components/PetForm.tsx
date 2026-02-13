import React, { useState, useEffect } from 'react';
import { PetData } from '../models/Pet';
import { PetService } from '../services/PetService';

interface PetFormProps {
  moradorId: string;
  pet?: PetData | null;
  onClose: () => void;
  onSave: () => void;
}

const PetForm: React.FC<PetFormProps> = ({ 
  moradorId,
  pet, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Omit<PetData, 'id' | 'createdAt' | 'updatedAt' | 'moradorId'>>({
    nome: '',
    tipo: 'outro',
    raca: '',
    porte: 'medio',
    fotoUrl: '',
    observacoes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const petService = new PetService();

  useEffect(() => {
    if (pet) {
      setFormData({
        nome: pet.nome || '',
        tipo: pet.tipo || 'outro',
        raca: pet.raca || '',
        porte: pet.porte || 'medio',
        fotoUrl: pet.fotoUrl || '',
        observacoes: pet.observacoes || '',
      });
    }
  }, [pet]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length > 50) {
      newErrors.nome = 'Nome não pode ter mais de 50 caracteres';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'Tipo é obrigatório';
    }

    if (!formData.porte) {
      newErrors.porte = 'Porte é obrigatório';
    }

    if (formData.raca && formData.raca.length > 50) {
      newErrors.raca = 'Raça não pode ter mais de 50 caracteres';
    }

    if (formData.observacoes && formData.observacoes.length > 200) {
      newErrors.observacoes = 'Observações não podem ter mais de 200 caracteres';
    }

    // Regra de negócio: para pets do tipo "outro", observações são obrigatórias
    if (formData.tipo === 'outro' && !formData.observacoes.trim()) {
      newErrors.observacoes = 'Observações são obrigatórias para pets do tipo "outro"';
    }

    // Validar URL da foto se fornecida
    if (formData.fotoUrl && formData.fotoUrl.trim()) {
      try {
        new URL(formData.fotoUrl);
      } catch (e) {
        newErrors.fotoUrl = 'URL da foto inválida';
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
      if (pet?.id) {
        // Atualizar pet existente
        await petService.updatePet(pet.id, {
          ...formData,
          moradorId: moradorId,
        });
      } else {
        // Criar novo pet
        await petService.createPet({
          ...formData,
          moradorId: moradorId,
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Erro ao salvar pet:', error);
      alert('Ocorreu um erro ao salvar o pet. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {pet?.id ? 'Editar Pet' : 'Novo Pet'}
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
              placeholder="Nome do pet"
            />
            {errors.nome && <p className="text-red-500 text-xs italic">{errors.nome}</p>}
          </div>

          <div className="mb-4">
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
              <option value="cao">Cão</option>
              <option value="gato">Gato</option>
              <option value="passaro">Pássaro</option>
              <option value="outro">Outro</option>
            </select>
            {errors.tipo && <p className="text-red-500 text-xs italic">{errors.tipo}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="raca">
              Raça
            </label>
            <input
              type="text"
              id="raca"
              name="raca"
              value={formData.raca}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.raca ? 'border-red-500' : ''}`}
              placeholder="Raça do pet"
            />
            {errors.raca && <p className="text-red-500 text-xs italic">{errors.raca}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="porte">
              Porte *
            </label>
            <select
              id="porte"
              name="porte"
              value={formData.porte}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.porte ? 'border-red-500' : ''}`}
            >
              <option value="pequeno">Pequeno</option>
              <option value="medio">Médio</option>
              <option value="grande">Grande</option>
            </select>
            {errors.porte && <p className="text-red-500 text-xs italic">{errors.porte}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fotoUrl">
              Foto URL
            </label>
            <input
              type="text"
              id="fotoUrl"
              name="fotoUrl"
              value={formData.fotoUrl}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="URL da foto do pet"
            />
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
              placeholder="Observações sobre o pet"
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
              {loading ? 'Salvando...' : pet?.id ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PetForm;