import React, { useState } from 'react';
import { ReservationList } from './components/ReservationList';
import { ReservationDashboard } from './components/ReservationDashboard';

interface ReservationModuleProps {
  condominiumId: string;
  userId: string;
  userRole?: 'admin' | 'resident';
}

const ReservationModule: React.FC<ReservationModuleProps> = ({ condominiumId, userId, userRole = 'resident' }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reservations'>('dashboard');

  return (
    <div className="reservation-module">
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
              onClick={() => setActiveTab('reservations')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'reservations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reservas
            </button>
          </nav>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'dashboard' && (
          <ReservationDashboard condominiumId={condominiumId} />
        )}
        {activeTab === 'reservations' && (
          <ReservationList condominiumId={condominiumId} userId={userId} userRole={userRole} />
        )}
      </div>
    </div>
  );
};

export default ReservationModule;