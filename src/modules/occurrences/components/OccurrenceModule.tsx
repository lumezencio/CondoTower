import React, { useState } from 'react';
import { OccurrenceList } from './components/OccurrenceList';
import { OccurrenceDashboard } from './components/OccurrenceDashboard';

interface OccurrenceModuleProps {
  condominiumId: string;
  userId: string;
  userRole?: 'admin' | 'staff' | 'resident';
}

const OccurrenceModule: React.FC<OccurrenceModuleProps> = ({ condominiumId, userId, userRole = 'resident' }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'occurrences'>('dashboard');

  return (
    <div className="occurrence-module">
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
              onClick={() => setActiveTab('occurrences')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'occurrences'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ocorrências
            </button>
          </nav>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'dashboard' && (
          <OccurrenceDashboard condominiumId={condominiumId} />
        )}
        {activeTab === 'occurrences' && (
          <OccurrenceList condominiumId={condominiumId} userId={userId} userRole={userRole} />
        )}
      </div>
    </div>
  );
};

export default OccurrenceModule;