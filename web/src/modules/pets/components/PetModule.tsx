import React, { useState } from 'react';
import { PetList } from './components/PetList';
import { PetDashboard } from './components/PetDashboard';

interface PetModuleProps {
  moradorId: string;
  userRole?: 'admin' | 'resident';
}

const PetModule: React.FC<PetModuleProps> = ({ moradorId, userRole = 'resident' }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pets'>('dashboard');

  return (
    <div className="pet-module">
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('pets')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'pets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Meus Pets
            </button>
          </nav>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'dashboard' && (
          <PetDashboard moradorId={moradorId} />
        )}
        {activeTab === 'pets' && (
          <PetList moradorId={moradorId} userRole={userRole} />
        )}
      </div>
    </div>
  );
};

export default PetModule;