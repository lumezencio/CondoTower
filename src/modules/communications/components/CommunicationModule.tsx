import React, { useState } from 'react';
import { ComunicadoList } from './components/ComunicadoList';
import { CommunicationDashboard } from './components/CommunicationDashboard';

interface CommunicationModuleProps {
  condominiumId: string;
  userId?: string; // Opcional - se não for fornecido, assume-se que é um administrador
}

const CommunicationModule: React.FC<CommunicationModuleProps> = ({ condominiumId, userId }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'comunicados'>('dashboard');

  return (
    <div className="communication-module">
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
              onClick={() => setActiveTab('comunicados')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'comunicados'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Comunicados
            </button>
          </nav>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'dashboard' && userId && (
          <CommunicationDashboard condominiumId={condominiumId} userId={userId} />
        )}
        {activeTab === 'comunicados' && (
          <ComunicadoList condominiumId={condominiumId} userId={userId} />
        )}
      </div>
    </div>
  );
};

export default CommunicationModule;