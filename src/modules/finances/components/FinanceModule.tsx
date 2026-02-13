import React, { useState } from 'react';
import { BillReceiveList } from './components/BillReceiveList';
import { BillPayList } from './components/BillPayList';
import { FinancialDashboard } from './components/FinancialDashboard';
import { FinancialReport } from './components/FinancialReport';

interface FinanceModuleProps {
  condominiumId: string;
}

const FinanceModule: React.FC<FinanceModuleProps> = ({ condominiumId }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'receive' | 'pay' | 'report'>('dashboard');

  return (
    <div className="finance-module">
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
              onClick={() => setActiveTab('receive')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'receive'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contas a Receber
            </button>
            <button
              onClick={() => setActiveTab('pay')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'pay'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contas a Pagar
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'report'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Relatórios
            </button>
          </nav>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'dashboard' && (
          <FinancialDashboard condominiumId={condominiumId} />
        )}
        {activeTab === 'receive' && (
          <BillReceiveList condominiumId={condominiumId} />
        )}
        {activeTab === 'pay' && (
          <BillPayList condominiumId={condominiumId} />
        )}
        {activeTab === 'report' && (
          <FinancialReport condominiumId={condominiumId} />
        )}
      </div>
    </div>
  );
};

export default FinanceModule;