import React, { useState } from 'react';
import { MeetingList } from './components/MeetingList';
import { MeetingDashboard } from './components/MeetingDashboard';

interface MeetingModuleProps {
  condominiumId: string;
  userId: string;
  userRole?: 'admin' | 'resident';
}

const MeetingModule: React.FC<MeetingModuleProps> = ({ condominiumId, userId, userRole = 'resident' }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'meetings'>('dashboard');

  return (
    <div className="meeting-module">
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
              onClick={() => setActiveTab('meetings')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'meetings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assembleias
            </button>
          </nav>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'dashboard' && (
          <MeetingDashboard condominiumId={condominiumId} />
        )}
        {activeTab === 'meetings' && (
          <MeetingList condominiumId={condominiumId} userId={userId} userRole={userRole} />
        )}
      </div>
    </div>
  );
};

export default MeetingModule;