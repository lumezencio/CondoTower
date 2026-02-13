import React, { useState, useEffect } from 'react';
import { FinanceService } from '../services/FinanceService';
import { BillPayData } from '../models/BillPay';

interface BillPayListProps {
  condominiumId: string;
}

const BillPayList: React.FC<BillPayListProps> = ({ condominiumId }) => {
  const [bills, setBills] = useState<BillPayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<BillPayData | null>(null);
  
  const financeService = new FinanceService();

  useEffect(() => {
    loadBills();
  }, [condominiumId]);

  const loadBills = async () => {
    try {
      const billsData = await financeService.getAllBillsPay(condominiumId);
      setBills(billsData);
    } catch (error) {
      console.error('Erro ao carregar contas a pagar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        await financeService.deleteBillPay(id);
        loadBills(); // Recarrega a lista após exclusão
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
      }
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      // Supondo que o usuário esteja autenticado e seu ID esteja disponível
      const userId = localStorage.getItem('userId') || 'system'; 
      await financeService.markBillPayAsPaid(id, userId);
      loadBills(); // Recarrega a lista após marcar como pago
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando contas a pagar...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contas a Pagar</h1>
        <button 
          onClick={() => {
            setEditingBill(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Nova Conta
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Título
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Data de Vencimento
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Fornecedor
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill.id} className="border-b border-gray-200">
                <td className="px-5 py-5 text-sm">{bill.title}</td>
                <td className="px-5 py-5 text-sm">R$ {bill.amount.toFixed(2)}</td>
                <td className="px-5 py-5 text-sm">{new Date(bill.dueDate).toLocaleDateString()}</td>
                <td className="px-5 py-5 text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                    bill.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    bill.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {bill.status === 'paid' ? 'Pago' : 
                     bill.status === 'overdue' ? 'Vencido' :
                     bill.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                  </span>
                </td>
                <td className="px-5 py-5 text-sm">{bill.supplierId || '-'}</td>
                <td className="px-5 py-5 text-sm">
                  <div className="flex space-x-2">
                    {bill.status === 'pending' && (
                      <button
                        onClick={() => handleMarkAsPaid(bill.id!)}
                        className="text-green-600 hover:text-green-900"
                        title="Marcar como Pago"
                      >
                        Pagar
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingBill(bill);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="Editar"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(bill.id!)}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para formulário */}
      {showForm && (
        <BillPayForm
          condominiumId={condominiumId}
          bill={editingBill}
          onClose={() => {
            setShowForm(false);
            setEditingBill(null);
          }}
          onSave={() => {
            loadBills();
            setShowForm(false);
            setEditingBill(null);
          }}
        />
      )}
    </div>
  );
};

export default BillPayList;