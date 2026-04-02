import React, { useState } from 'react';
import { ReportDashboard } from './components/ReportDashboard';
import { ReportGenerator } from './components/ReportGenerator';

interface ReportModuleProps {
  condominiumId: string;
  userId: string;
  userRole?: 'admin' | 'resident';
}

const ReportModule: React.FC<ReportModuleProps> = ({ condominiumId, userId, userRole = 'resident' }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'generator'>('dashboard');

  return (
    <div className="report-module">
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
              onClick={() => setActiveTab('generator')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'generator'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gerador de Relatórios
            </button>
          </nav>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'dashboard' && (
          <ReportDashboard condominiumId={condominiumId} userId={userId} />
        )}
        {activeTab === 'generator' && (
          <ReportGenerator condominiumId={condominiumId} userId={userId} />
        )}
      </div>
    </div>
  );
};

export default ReportModule;