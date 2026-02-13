import React, { useState, useEffect } from 'react';
import { PetService } from '../services/PetService';
import { PetData } from '../models/Pet';

interface PetListProps {
  moradorId: string;
  userRole?: 'admin' | 'resident';
}

const PetList: React.FC<PetListProps> = ({ moradorId, userRole = 'resident' }) => {
  const [pets, setPets] = useState<PetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState<PetData | null>(null);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPorte, setSelectedPorte] = useState('all');
  
  const petService = new PetService();

  useEffect(() => {
    loadPets();
  }, [moradorId, selectedType, selectedPorte]);

  const loadPets = async () => {
    try {
      let filters: any = {};
      
      if (selectedType !== 'all') {
        filters.tipo = selectedType;
      }
      
      if (selectedPorte !== 'all') {
        filters.porte = selectedPorte;
      }
      
      const petsData = await petService.getAllPets(userRole === 'admin' ? undefined : moradorId, filters);
      setPets(petsData);
    } catch (error) {
      console.error('Erro ao carregar pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este pet?')) {
      try {
        await petService.deletePet(id);
        loadPets();
      } catch (error) {
        console.error('Erro ao excluir pet:', error);
      }
    }
  };

  const getTypeLabel = (type: string): string => {
    switch(type) {
      case 'cao': return 'Cão';
      case 'gato': return 'Gato';
      case 'passaro': return 'Pássaro';
      case 'outro': return 'Outro';
      default: return type;
    }
  };

  const getPorteLabel = (porte: string): string => {
    switch(porte) {
      case 'pequeno': return 'Pequeno';
      case 'medio': return 'Médio';
      case 'grande': return 'Grande';
      default: return porte;
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando pets...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-800">Meus Pets</h1>
        <button 
          onClick={() => {
            setEditingPet(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Novo Pet
        </button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="w-full md:w-1/2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="all">Todos os tipos</option>
            <option value="cao">Cão</option>
            <option value="gato">Gato</option>
            <option value="passaro">Pássaro</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div className="w-full md:w-1/2">
          <select
            value={selectedPorte}
            onChange={(e) => setSelectedPorte(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="all">Todos os portes</option>
            <option value="pequeno">Pequeno</option>
            <option value="medio">Médio</option>
            <option value="grande">Grande</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.length > 0 ? (
          pets.map((pet) => (
            <div key={pet.id} className="bg-white shadow rounded-lg p-4 border">
              <div className="flex items-center">
                {pet.fotoUrl ? (
                  <img 
                    src={pet.fotoUrl} 
                    alt={pet.nome} 
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <span className="text-gray-500 text-2xl">🐶</span>
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-800">{pet.nome}</h3>
                  <p className="text-gray-600 text-sm">{getTypeLabel(pet.tipo)} - {getPorteLabel(pet.porte)}</p>
                  {pet.raca && (
                    <p className="text-gray-600 text-xs">Raça: {pet.raca}</p>
                  )}
                </div>
              </div>
              <div className="mt-3">
                {pet.observacoes && (
                  <p className="text-gray-600 text-sm mb-2">{pet.observacoes}</p>
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingPet(pet);
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                    title="Editar"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(pet.id!)}
                    className="text-red-600 hover:text-red-900 text-sm"
                    title="Excluir"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Nenhum pet cadastrado.</p>
          </div>
        )}
      </div>

      {/* Modal para formulário */}
      {showForm && (
        <PetForm
          moradorId={moradorId}
          pet={editingPet}
          onClose={() => {
            setShowForm(false);
            setEditingPet(null);
          }}
          onSave={() => {
            loadPets();
            setShowForm(false);
            setEditingPet(null);
          }}
        />
      )}
    </div>
  );
};

export default PetList;