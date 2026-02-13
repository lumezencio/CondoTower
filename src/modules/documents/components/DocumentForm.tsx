import React, { useState, useEffect } from 'react';
import { DocumentoData } from '../models/Documento';
import { DocumentService } from '../services/DocumentService';

interface DocumentFormProps {
  condominiumId: string;
  userId: string;
  documento?: DocumentoData | null;
  onClose: () => void;
  onSave: () => void;
}

const DocumentForm: React.FC<DocumentFormProps> = ({ 
  condominiumId, 
  userId,
  documento, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Omit<DocumentoData, 'id' | 'createdAt' | 'updatedAt' | 'tamanho' | 'tipoArquivo'>>({
    nome: '',
    descricao: '',
    categoria: 'outro',
    arquivoUrl: '',
    visibilidade: 'todos',
    autorId: userId,
    condominioId: condominiumId,
  });

  const [fileInfo, setFileInfo] = useState<{size: number, type: string} | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const documentService = new DocumentService();

  useEffect(() => {
    if (documento) {
      setFormData({
        nome: documento.nome || '',
        descricao: documento.descricao || '',
        categoria: documento.categoria || 'outro',
        arquivoUrl: documento.arquivoUrl || '',
        visibilidade: documento.visibilidade || 'todos',
        autorId: documento.autorId,
        condominioId: documento.condominioId,
      });
      
      // Extrair informações do arquivo a partir da URL se possível
      if (documento.arquivoUrl) {
        const extension = documento.arquivoUrl.split('.').pop()?.toLowerCase() || '';
        setFileInfo({
          size: documento.tamanho || 0,
          type: extension
        });
      }
    }
  }, [documento]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileInfo({
        size: file.size,
        type: file.type.split('/')[1] || file.name.split('.').pop() || 'unknown'
      });
      
      // Para este exemplo, vamos simular o upload e armazenar a URL temporariamente
      // Na aplicação real, isso seria substituído por um serviço de upload real
      setFormData(prev => ({
        ...prev,
        arquivoUrl: URL.createObjectURL(file),
        tamanho: file.size,
        tipoArquivo: file.type.split('/')[1] || file.name.split('.').pop() || 'unknown'
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length > 200) {
      newErrors.nome = 'Nome não pode ter mais de 200 caracteres';
    }

    if (!formData.arquivoUrl.trim()) {
      newErrors.arquivoUrl = 'Arquivo é obrigatório';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Categoria é obrigatória';
    }

    if (formData.descricao && formData.descricao.length > 1000) {
      newErrors.descricao = 'Descrição não pode ter mais de 1000 caracteres';
    }

    if (!fileInfo) {
      newErrors.arquivoUrl = 'Arquivo é obrigatório';
    } else if (fileInfo.size <= 0) {
      newErrors.arquivoUrl = 'Tamanho do arquivo deve ser maior que zero';
    } else if (fileInfo.size > 50 * 1024 * 1024) { // 50 MB
      newErrors.arquivoUrl = 'Tamanho do arquivo não pode exceder 50 MB';
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
      if (documento?.id) {
        // Atualizar documento existente
        await documentService.updateDocumento(documento.id, {
          ...formData,
          tamanho: fileInfo?.size || 0,
          tipoArquivo: fileInfo?.type || 'unknown',
        });
      } else {
        // Criar novo documento
        if (!fileInfo) {
          throw new Error('Informações do arquivo não disponíveis');
        }
        
        await documentService.createDocumento({
          ...formData,
          tamanho: fileInfo.size,
          tipoArquivo: fileInfo.type,
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      alert('Ocorreu um erro ao salvar o documento. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {documento?.id ? 'Editar Documento' : 'Novo Documento'}
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
              placeholder="Nome do documento"
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
              placeholder="Descrição do documento"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoria">
                Categoria *
              </label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.categoria ? 'border-red-500' : ''}`}
              >
                <option value="ata_assembleia">Ata de Assembleia</option>
                <option value="convencao">Convenção</option>
                <option value="regimento_interno">Regimento Interno</option>
                <option value="contrato">Contrato</option>
                <option value="apolice_seguro">Apólice de Seguro</option>
                <option value="fiscal">Documentos Fiscais</option>
                <option value="projeto_planta">Projetos e Plantas</option>
                <option value="manual_equipamento">Manuais de Equipamentos</option>
                <option value="outro">Outros</option>
              </select>
              {errors.categoria && <p className="text-red-500 text-xs italic">{errors.categoria}</p>}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="visibilidade">
                Visibilidade
              </label>
              <select
                id="visibilidade"
                name="visibilidade"
                value={formData.visibilidade}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="todos">Todos</option>
                <option value="conselho">Conselho</option>
                <option value="administracao">Administração</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="arquivo">
              Arquivo *
            </label>
            <input
              type="file"
              id="arquivo"
              name="arquivo"
              onChange={handleFileChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.arquivoUrl ? 'border-red-500' : ''}`}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
            />
            {errors.arquivoUrl && <p className="text-red-500 text-xs italic">{errors.arquivoUrl}</p>}
            
            {fileInfo && (
              <div className="mt-2 text-sm text-gray-600">
                Arquivo selecionado: {fileInfo.type} ({Math.round(fileInfo.size / 1024)} KB)
              </div>
            )}
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
              {loading ? 'Salvando...' : documento?.id ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentForm;