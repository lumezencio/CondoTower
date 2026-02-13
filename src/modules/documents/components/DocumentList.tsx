import React, { useState, useEffect } from 'react';
import { DocumentService } from '../services/DocumentService';
import { DocumentoData } from '../models/Documento';

interface DocumentListProps {
  condominiumId: string;
  userId: string;
  userRole?: 'admin' | 'resident' | 'visitor';
}

const DocumentList: React.FC<DocumentListProps> = ({ condominiumId, userId, userRole = 'resident' }) => {
  const [documentos, setDocumentos] = useState<DocumentoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDocumento, setEditingDocumento] = useState<DocumentoData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const documentService = new DocumentService();

  useEffect(() => {
    loadDocumentos();
  }, [condominiumId, searchTerm, selectedCategory]);

  const loadDocumentos = async () => {
    try {
      let filters: any = {};
      
      if (selectedCategory !== 'all') {
        filters.categoria = selectedCategory;
      }
      
      let documentosData: DocumentoData[];
      
      if (searchTerm) {
        documentosData = await documentService.searchDocumentos(condominiumId, searchTerm);
      } else {
        documentosData = await documentService.getAllDocumentos(condominiumId, filters);
      }
      
      // Filtrar por visibilidade baseada no papel do usuário
      const filteredDocumentos = documentosData.filter(doc => {
        if (doc.visibilidade === 'todos') return true;
        if (doc.visibilidade === 'conselho' && (userRole === 'admin' || userRole === 'conselho')) return true;
        if (doc.visibilidade === 'administracao' && userRole === 'admin') return true;
        return false;
      });
      
      setDocumentos(filteredDocumentos);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.')) {
      try {
        await documentService.deleteDocumento(id);
        loadDocumentos();
      } catch (error) {
        console.error('Erro ao excluir documento:', error);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryLabel = (category: string): string => {
    switch(category) {
      case 'ata_assembleia': return 'Ata de Assembleia';
      case 'convencao': return 'Convenção';
      case 'regimento_interno': return 'Regimento Interno';
      case 'contrato': return 'Contrato';
      case 'apolice_seguro': return 'Apólice de Seguro';
      case 'fiscal': return 'Documentos Fiscais';
      case 'projeto_planta': return 'Projetos e Plantas';
      case 'manual_equipamento': return 'Manuais de Equipamentos';
      case 'outro': return 'Outros';
      default: return category;
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando documentos...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-800">Documentos do Condomínio</h1>
        {userRole === 'admin' && (
          <button 
            onClick={() => {
              setEditingDocumento(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Novo Documento
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="w-full md:w-2/3">
          <input
            type="text"
            placeholder="Pesquisar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="w-full md:w-1/3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="all">Todas as categorias</option>
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
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tamanho
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Visibilidade
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Data
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {documentos.length > 0 ? (
              documentos.map((documento) => (
                <tr key={documento.id} className="border-b border-gray-200">
                  <td className="px-5 py-5 text-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full mr-3">
                        <span className="text-blue-800 font-bold">
                          {documento.tipoArquivo.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{documento.nome}</div>
                        {documento.descricao && (
                          <div className="text-gray-600 text-xs mt-1">{documento.descricao.substring(0, 50)}{documento.descricao.length > 50 ? '...' : ''}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5 text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      {getCategoryLabel(documento.categoria)}
                    </span>
                  </td>
                  <td className="px-5 py-5 text-sm">
                    {formatFileSize(documento.tamanho)}
                  </td>
                  <td className="px-5 py-5 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      documento.visibilidade === 'administracao' ? 'bg-red-100 text-red-800' :
                      documento.visibilidade === 'conselho' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {documento.visibilidade === 'administracao' ? 'Administração' :
                       documento.visibilidade === 'conselho' ? 'Conselho' : 'Todos'}
                    </span>
                  </td>
                  <td className="px-5 py-5 text-sm">
                    {new Date(documento.createdAt!).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-5 text-sm">
                    <div className="flex space-x-2">
                      <a
                        href={documento.arquivoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                        title="Baixar"
                      >
                        Baixar
                      </a>
                      {userRole === 'admin' && (
                        <>
                          <button
                            onClick={() => {
                              setEditingDocumento(documento);
                              setShowForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(documento.id!)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            Excluir
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-5 text-sm text-center text-gray-500">
                  Nenhum documento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para formulário */}
      {showForm && userRole === 'admin' && (
        <DocumentForm
          condominiumId={condominiumId}
          userId={userId}
          documento={editingDocumento}
          onClose={() => {
            setShowForm(false);
            setEditingDocumento(null);
          }}
          onSave={() => {
            loadDocumentos();
            setShowForm(false);
            setEditingDocumento(null);
          }}
        />
      )}
    </div>
  );
};

export default DocumentList;