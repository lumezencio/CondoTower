import React, { useState } from 'react';
import { DeliveryList } from './components/DeliveryList';
import { DeliveryDashboard } from './components/DeliveryDashboard';

interface DeliveryModuleProps {
  condominiumId: string;
  userId: string;
  userRole?: 'admin' | 'resident' | 'staff';
}

const DeliveryModule: React.FC<DeliveryModuleProps> = ({ condominiumId, userId, userRole = 'resident' }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'deliveries'>('dashboard');

  return (
    <div className="delivery-module">
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
              onClick={() => setActiveTab('deliveries')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'deliveries'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Encomendas
            </button>
          </nav>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'dashboard' && (
          <DeliveryDashboard condominiumId={condominiumId} />
        )}
        {activeTab === 'deliveries' && (
          <DeliveryList condominiumId={condominiumId} userId={userId} userRole={userRole} />
        )}
      </div>
    </div>
  );
};

export default DeliveryModule;