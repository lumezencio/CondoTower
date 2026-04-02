'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Trash2, Plus, AlertCircle } from 'lucide-react';

interface TicketFormData {
  titulo: string;
  descricao: string;
  tipo: string;
  categoria: string;
  prioridade: string;
  localAfetado?: string;
  apartamentoId?: string;
  dataPrevisao?: string;
  observacoes?: string;
}

interface TicketFormProps {
  initialData?: Partial<TicketFormData>;
  onSubmit: (data: TicketFormData) => Promise<void> | void;
  onCancel: () => void;
  condominioId: string;
  apartamentos?: Array<{ id: string; numero: string; bloco: string }>;
  loading?: boolean;
}

const TicketForm: React.FC<TicketFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  condominioId,
  apartamentos = [],
  loading = false,
}) => {
  const [formData, setFormData] = useState<TicketFormData>({
    titulo: initialData?.titulo || '',
    descricao: initialData?.descricao || '',
    tipo: initialData?.tipo || 'solicitacao_servico',
    categoria: initialData?.categoria || 'outro',
    prioridade: initialData?.prioridade || 'media',
    localAfetado: initialData?.localAfetado || '',
    apartamentoId: initialData?.apartamentoId || '',
    dataPrevisao: initialData?.dataPrevisao || '',
    observacoes: initialData?.observacoes || '',
  });

  const [fotos, setFotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tiposChamado = [
    { value: 'manutencao_preventiva', label: 'Manutenção Preventiva' },
    { value: 'manutencao_corretiva', label: 'Manutenção Corretiva' },
    { value: 'solicitacao_servico', label: 'Solicitação de Serviço' },
    { value: 'reclamacao', label: 'Reclamação' },
    { value: 'sugestao', label: 'Sugestão' },
    { value: 'emergencia', label: 'Emergência' },
  ];

  const categorias = [
    { value: 'eletrica', label: 'Elétrica' },
    { value: 'hidraulica', label: 'Hidráulica' },
    { value: 'elevador', label: 'Elevador' },
    { value: 'ar_condicionado', label: 'Ar Condicionado' },
    { value: 'piscina', label: 'Piscina' },
    { value: 'jardim', label: 'Jardim' },
    { value: 'limpeza', label: 'Limpeza' },
    { value: 'seguranca', label: 'Segurança' },
    { value: 'estrutural', label: 'Estrutural' },
    { value: 'eletronica', label: 'Eletrônica' },
    { value: 'telefonia', label: 'Telefonia' },
    { value: 'internet', label: 'Internet' },
    { value: 'gas', label: 'Gás' },
    { value: 'incendio', label: 'Incêndio' },
    { value: 'outro', label: 'Outro' },
  ];

  const prioridades = [
    { value: 'baixa', label: 'Baixa' },
    { value: 'media', label: 'Média' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' },
    { value: 'emergencia', label: 'Emergência' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo || formData.titulo.trim().length === 0) {
      newErrors.titulo = 'Título é obrigatório';
    } else if (formData.titulo.trim().length > 200) {
      newErrors.titulo = 'Título não pode ter mais de 200 caracteres';
    }

    if (!formData.descricao || formData.descricao.trim().length === 0) {
      newErrors.descricao = 'Descrição é obrigatória';
    } else if (formData.descricao.trim().length < 10) {
      newErrors.descricao = 'Descrição deve ter pelo menos 10 caracteres';
    } else if (formData.descricao.trim().length > 2000) {
      newErrors.descricao = 'Descrição não pode ter mais de 2000 caracteres';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'Tipo é obrigatório';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Categoria é obrigatória';
    }

    if (!formData.prioridade) {
      newErrors.prioridade = 'Prioridade é obrigatória';
    }

    // Regras específicas
    if (formData.tipo === 'emergencia' && formData.prioridade !== 'emergencia' && formData.prioridade !== 'urgente') {
      newErrors.prioridade = 'Chamados de emergência devem ter prioridade Emergência ou Urgente';
    }

    if (formData.categoria === 'incendio' && formData.prioridade !== 'emergencia') {
      newErrors.prioridade = 'Chamados de incêndio devem ter prioridade Emergência';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao salvar chamado:', error);
    }
  };

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFotos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            {initialData ? 'Editar Chamado' : 'Novo Chamado'}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Preencha as informações abaixo para {initialData ? 'editar' : 'criar'} o chamado
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-neutral-500" />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                errors.titulo ? 'border-red-500' : 'border-neutral-300'
              }`}
              placeholder="Ex: Vazamento de água no bloco A"
            />
            {errors.titulo && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.titulo}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Tipo *
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                errors.tipo ? 'border-red-500' : 'border-neutral-300'
              }`}
            >
              {tiposChamado.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
            {errors.tipo && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.tipo}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Categoria *
            </label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                errors.categoria ? 'border-red-500' : 'border-neutral-300'
              }`}
            >
              {categorias.map(categoria => (
                <option key={categoria.value} value={categoria.value}>{categoria.label}</option>
              ))}
            </select>
            {errors.categoria && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.categoria}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Prioridade *
            </label>
            <select
              value={formData.prioridade}
              onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                errors.prioridade ? 'border-red-500' : 'border-neutral-300'
              }`}
            >
              {prioridades.map(prioridade => (
                <option key={prioridade.value} value={prioridade.value}>{prioridade.label}</option>
              ))}
            </select>
            {errors.prioridade && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.prioridade}
              </p>
            )}
          </div>

          {apartamentos.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Apartamento (opcional)
              </label>
              <select
                value={formData.apartamentoId}
                onChange={(e) => setFormData({ ...formData, apartamentoId: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Selecione...</option>
                {apartamentos.map(apt => (
                  <option key={apt.id} value={apt.id}>
                    {apt.bloco} - Apto {apt.numero}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Descrição *
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={5}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none ${
                errors.descricao ? 'border-red-500' : 'border-neutral-300'
              }`}
              placeholder="Descreva detalhadamente o problema ou solicitação..."
            />
            <div className="flex justify-between items-center mt-1">
              {errors.descricao ? (
                <p className="text-red-600 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.descricao}
                </p>
              ) : (
                <span />
              )}
              <span className="text-xs text-neutral-400">
                {formData.descricao.length}/2000 caracteres
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Local Afetado
            </label>
            <input
              type="text"
              value={formData.localAfetado}
              onChange={(e) => setFormData({ ...formData, localAfetado: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="Ex: Hall de entrada, Bloco A, Jardim frontal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Previsão de Conclusão
            </label>
            <input
              type="date"
              value={formData.dataPrevisao}
              onChange={(e) => setFormData({ ...formData, dataPrevisao: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Observações Adicionais
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Informações adicionais (opcional)..."
            />
          </div>
        </div>

        {/* Upload de Fotos */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Fotos (opcional)
          </label>
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFotoUpload}
              className="hidden"
              id="foto-upload"
            />
            <label htmlFor="foto-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm text-neutral-600">
                Clique para upload ou arraste as fotos aqui
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                PNG, JPG até 5MB cada
              </p>
            </label>
          </div>

          {fotos.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {fotos.map((foto, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 group">
                  <img src={foto} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFoto(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-neutral-200 bg-neutral-50 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors font-medium"
        >
          Cancelar
        </button>
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="px-4 py-2 bg-gradient-to-b from-primary-500 to-primary-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando...' : initialData ? 'Atualizar Chamado' : 'Criar Chamado'}
        </motion.button>
      </div>
    </form>
  );
};

export default TicketForm;
