'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Building2, Phone, Mail, Car, Dog, User, Edit, Trash2 } from 'lucide-react';

interface Owner {
  id: string;
  name: string;
  type: string;
  cpf: string;
  phone?: string;
  email?: string;
  unit?: { block: string; number: string };
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  size?: string;
  unit?: { block: string; number: string };
}

interface Vehicle {
  id: string;
  plate: string;
  brand?: string;
  model?: string;
  color?: string;
  unit?: { block: string; number: string };
}

export default function CadastrosPage() {
  const [activeTab, setActiveTab] = useState<'owners' | 'pets' | 'vehicles'>('owners');
  const [owners, setOwners] = useState<Owner[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'owners') {
        const res = await fetch('/api/owners?page=1&pageSize=100&tenant=parkclub');
        const data = await res.json();
        if (data.ok) setOwners(data.data);
      } else if (activeTab === 'pets') {
        const res = await fetch('/api/pets?page=1&pageSize=100&tenant=parkclub');
        const data = await res.json();
        if (data.ok) setPets(data.data);
      } else if (activeTab === 'vehicles') {
        const res = await fetch('/api/vehicles?page=1&pageSize=100&tenant=parkclub');
        const data = await res.json();
        if (data.ok) setVehicles(data.data);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PROPRIETARIO: 'Proprietário',
      INQUILINO: 'Inquilino',
    };
    return labels[type] || type;
  };

  const getSpeciesLabel = (species: string) => {
    const labels: Record<string, string> = {
      CACHORRO: '🐕 Cachorro',
      GATO: '🐱 Gato',
      PASSARO: '🐦 Pássaro',
      OUTRO: 'Outro',
    };
    return labels[species] || species;
  };

  const filteredOwners = owners.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.cpf.includes(searchTerm) ||
    o.unit?.number.includes(searchTerm)
  );

  const filteredPets = pets.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            Cadastro de Moradores
          </h1>
          <p className="text-neutral-500 mt-1 ml-1">Gerencie proprietários, inquilinos, pets e veículos</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all">
          <Plus className="w-5 h-5" />
          Novo Cadastro
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('owners')}
          className={`px-4 py-2 font-medium text-sm transition-colors relative ${
            activeTab === 'owners'
              ? 'text-blue-600'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Proprietários/Inquilinos
          </div>
          {activeTab === 'owners' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('pets')}
          className={`px-4 py-2 font-medium text-sm transition-colors relative ${
            activeTab === 'pets'
              ? 'text-green-600'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Dog className="w-4 h-4" />
            Pets
          </div>
          {activeTab === 'pets' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-4 py-2 font-medium text-sm transition-colors relative ${
            activeTab === 'vehicles'
              ? 'text-purple-600'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            Veículos
          </div>
          {activeTab === 'vehicles' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'owners' ? 'Buscar por nome, CPF ou unidade...' :
              activeTab === 'pets' ? 'Buscar por nome ou espécie...' :
              'Buscar por placa ou marca...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
              <span className="text-neutral-500">Carregando...</span>
            </div>
          </div>
        ) : activeTab === 'owners' ? (
          <div className="divide-y divide-neutral-100">
            {filteredOwners.length === 0 ? (
              <div className="px-6 py-12 text-center text-neutral-500">
                Nenhum proprietário/inquilino encontrado
              </div>
            ) : (
              filteredOwners.map((owner) => (
                <div key={owner.id} className="p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-neutral-900">{owner.name}</p>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {getTypeLabel(owner.type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
                          <span>CPF: {owner.cpf}</span>
                          {owner.unit && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {owner.unit.block} - {owner.unit.number}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
                          {owner.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {owner.phone}
                            </span>
                          )}
                          {owner.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {owner.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-neutral-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'pets' ? (
          <div className="divide-y divide-neutral-100">
            {filteredPets.length === 0 ? (
              <div className="px-6 py-12 text-center text-neutral-500">
                Nenhum pet encontrado
              </div>
            ) : (
              filteredPets.map((pet) => (
                <div key={pet.id} className="p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                        <Dog className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{pet.name}</p>
                        <p className="text-sm text-neutral-500">
                          {getSpeciesLabel(pet.species)}
                          {pet.breed && ` • ${pet.breed}`}
                          {pet.size && ` • ${pet.size}`}
                        </p>
                        {pet.unit && (
                          <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {pet.unit.block} - {pet.unit.number}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-neutral-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredVehicles.length === 0 ? (
              <div className="px-6 py-12 text-center text-neutral-500">
                Nenhum veículo encontrado
              </div>
            ) : (
              filteredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <Car className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-neutral-900">{vehicle.plate}</p>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 uppercase">
                            {vehicle.plate}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-500">
                          {vehicle.brand} {vehicle.model}
                          {vehicle.color && ` • ${vehicle.color}`}
                          {vehicle.year && ` • ${vehicle.year}`}
                        </p>
                        {vehicle.unit && (
                          <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {vehicle.unit.block} - {vehicle.unit.number}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-neutral-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
