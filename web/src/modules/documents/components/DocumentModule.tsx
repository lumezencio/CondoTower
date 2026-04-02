import React, { useState } from 'react';
import { DocumentList } from './components/DocumentList';
import { DocumentDashboard } from './components/DocumentDashboard';

interface DocumentModuleProps {
  condominiumId: string;
  userId: string;
  userRole?: 'admin' | 'resident' | 'visitor';
}

const DocumentModule: React.FC<DocumentModuleProps> = ({ condominiumId, userId, userRole = 'resident' }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'documents'>('dashboard');

  return (
    <div className="document-module">
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
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Documentos
            </button>
          </nav>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'dashboard' && (
          <DocumentDashboard condominiumId={condominiumId} />
        )}
        {activeTab === 'documents' && (
          <DocumentList condominiumId={condominiumId} userId={userId} userRole={userRole} />
        )}
      </div>
    </div>
  );
};

export default DocumentModule;