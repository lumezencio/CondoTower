import React, { useState, useEffect } from 'react';
import { CommunicationService } from '../services/CommunicationService';
import { ComunicadoData } from '../models/Comunicado';

interface ComunicadoListProps {
  condominiumId: string;
  userId?: string; // Opcional - se não for fornecido, assume-se que é um administrador
}

const ComunicadoList: React.FC<ComunicadoListProps> = ({ condominiumId, userId }) => {
  const [comunicados, setComunicados] = useState<ComunicadoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingComunicado, setEditingComunicado] = useState<ComunicadoData | null>(null);
  const [fixedMessages, setFixedMessages] = useState<ComunicadoData[]>([]);
  
  const communicationService = new CommunicationService();

  useEffect(() => {
    loadComunicados();
    loadFixedMessages();
  }, [condominiumId]);

  const loadComunicados = async () => {
    try {
      const comunicadosData = await communicationService.getAllComunicados(condominiumId);
      setComunicados(comunicadosData);
    } catch (error) {
      console.error('Erro ao carregar comunicados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFixedMessages = async () => {
    try {
      const fixedData = await communicationService.getFixedComunicados(condominiumId);
      setFixedMessages(fixedData);
    } catch (error) {
      console.error('Erro ao carregar comunicados fixados:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este comunicado?')) {
      try {
        await communicationService.deleteComunicado(id);
        loadComunicados();
        loadFixedMessages();
      } catch (error) {
        console.error('Erro ao excluir comunicado:', error);
      }
    }
  };

  const handlePinToggle = async (id: string, isPinned: boolean) => {
    try {
      if (isPinned) {
        await communicationService.unpinComunicado(id);
      } else {
        await communicationService.pinComunicado(id);
      }
      loadComunicados();
      loadFixedMessages();
    } catch (error) {
      console.error('Erro ao alterar fixação do comunicado:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    if (userId) {
      try {
        await communicationService.markComunicadoAsRead(userId, id);
        // Atualiza a lista para refletir a mudança de status de leitura
        loadComunicados();
      } catch (error) {
        console.error('Erro ao marcar comunicado como lido:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando comunicados...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Comunicados</h1>
        {userId && (
          <button 
            onClick={() => {
              setEditingComunicado(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Novo Comunicado
          </button>
        )}
      </div>

      {/* Comunicados Fixados */}
      {fixedMessages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Comunicados Fixados</h2>
          <div className="space-y-4">
            {fixedMessages.map((comunicado) => (
              <div key={comunicado.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800">{comunicado.titulo}</h3>
                    <p className="text-gray-600 mt-1">{comunicado.conteudo.substring(0, 150)}{comunicado.conteudo.length > 150 ? '...' : ''}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        comunicado.prioridade === 'baixa' ? 'bg-green-100 text-green-800' :
                        comunicado.prioridade === 'normal' ? 'bg-blue-100 text-blue-800' :
                        comunicado.prioridade === 'alta' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {comunicado.prioridade.charAt(0).toUpperCase() + comunicado.prioridade.slice(1)}
                      </span>
                      <span className="ml-2">{new Date(comunicado.dataPublicacao!).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!userId && (
                      <button
                        onClick={() => handleMarkAsRead(comunicado.id!)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Marcar como Lido"
                      >
                        ✓
                      </button>
                    )}
                    {userId && (
                      <>
                        <button
                          onClick={() => {
                            setEditingComunicado(comunicado);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(comunicado.id!)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                        <button
                          onClick={() => handlePinToggle(comunicado.id!, comunicado.fixado)}
                          className="text-gray-600 hover:text-gray-900"
                          title={comunicado.fixado ? "Desafixar" : "Fixar"}
                        >
                          {comunicado.fixado ? '📍' : '📌'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Comunicados */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Título
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Prioridade
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
            {comunicados.map((comunicado) => (
              <tr key={comunicado.id} className="border-b border-gray-200">
                <td className="px-5 py-5 text-sm">
                  <div className="font-medium text-gray-900">{comunicado.titulo}</div>
                  <div className="text-gray-600 mt-1">{comunicado.conteudo.substring(0, 100)}{comunicado.conteudo.length > 100 ? '...' : ''}</div>
                </td>
                <td className="px-5 py-5 text-sm">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                    {comunicado.tipo.replace('_', ' ').charAt(0).toUpperCase() + comunicado.tipo.replace('_', ' ').slice(1)}
                  </span>
                </td>
                <td className="px-5 py-5 text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    comunicado.prioridade === 'baixa' ? 'bg-green-100 text-green-800' :
                    comunicado.prioridade === 'normal' ? 'bg-blue-100 text-blue-800' :
                    comunicado.prioridade === 'alta' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {comunicado.prioridade.charAt(0).toUpperCase() + comunicado.prioridade.slice(1)}
                  </span>
                </td>
                <td className="px-5 py-5 text-sm">
                  {new Date(comunicado.dataPublicacao!).toLocaleDateString()}
                </td>
                <td className="px-5 py-5 text-sm">
                  <div className="flex space-x-2">
                    {!userId && (
                      <button
                        onClick={() => handleMarkAsRead(comunicado.id!)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Marcar como Lido"
                      >
                        ✓
                      </button>
                    )}
                    {userId && (
                      <>
                        <button
                          onClick={() => {
                            setEditingComunicado(comunicado);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(comunicado.id!)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          Excluir
                        </button>
                        <button
                          onClick={() => handlePinToggle(comunicado.id!, comunicado.fixado)}
                          className="text-gray-600 hover:text-gray-900"
                          title={comunicado.fixado ? "Desafixar" : "Fixar"}
                        >
                          {comunicado.fixado ? 'Desafixar' : 'Fixar'}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para formulário */}
      {showForm && userId && (
        <ComunicadoForm
          condominiumId={condominiumId}
          userId={userId}
          comunicado={editingComunicado}
          onClose={() => {
            setShowForm(false);
            setEditingComunicado(null);
          }}
          onSave={() => {
            loadComunicados();
            loadFixedMessages();
            setShowForm(false);
            setEditingComunicado(null);
          }}
        />
      )}
    </div>
  );
};

export default ComunicadoList;