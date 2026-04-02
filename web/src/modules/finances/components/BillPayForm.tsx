import React, { useState, useEffect } from 'react';
import { BillPayData } from '../models/BillPay';
import { FinanceService } from '../services/FinanceService';

interface BillPayFormProps {
  condominiumId: string;
  bill?: BillPayData | null;
  onClose: () => void;
  onSave: () => void;
}

const BillPayForm: React.FC<BillPayFormProps> = ({ 
  condominiumId, 
  bill, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Omit<BillPayData, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    amount: 0,
    dueDate: new Date(),
    status: 'pending',
    condominiumId: condominiumId,
    supplierId: undefined,
    paidBy: undefined,
    paymentMethod: undefined,
    documentNumber: undefined,
    category: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const financeService = new FinanceService();

  useEffect(() => {
    if (bill) {
      setFormData({
        title: bill.title || '',
        description: bill.description || '',
        amount: bill.amount || 0,
        dueDate: bill.dueDate || new Date(),
        paidDate: bill.paidDate,
        status: bill.status || 'pending',
        condominiumId: bill.condominiumId,
        supplierId: bill.supplierId,
        paidBy: bill.paidBy,
        paymentMethod: bill.paymentMethod,
        documentNumber: bill.documentNumber,
        category: bill.category,
      });
    }
  }, [bill]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Date') ? new Date(value) : name === 'amount' ? parseFloat(value) : value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Data de vencimento é obrigatória';
    } else if (new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'Data de vencimento não pode ser anterior à data atual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (bill?.id) {
        // Atualizar conta existente
        await financeService.updateBillPay(bill.id, formData);
      } else {
        // Criar nova conta
        await financeService.createBillPay({
          ...formData,
          condominiumId
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Erro ao salvar conta a pagar:', error);
      alert('Ocorreu um erro ao salvar a conta. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {bill?.id ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Título *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <p className="text-red-500 text-xs italic">{errors.title}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
              Valor (R$) *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.amount ? 'border-red-500' : ''}`}
            />
            {errors.amount && <p className="text-red-500 text-xs italic">{errors.amount}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dueDate">
              Data de Vencimento *
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate.toISOString().split('T')[0]}
              onChange={handleChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.dueDate ? 'border-red-500' : ''}`}
            />
            {errors.dueDate && <p className="text-red-500 text-xs italic">{errors.dueDate}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supplierId">
              Fornecedor
            </label>
            <input
              type="text"
              id="supplierId"
              name="supplierId"
              value={formData.supplierId || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="ID do fornecedor (opcional)"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
              Categoria
            </label>
            <select
              id="category"
              name="category"
              value={formData.category || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Selecione...</option>
              <option value="maintenance">Manutenção</option>
              <option value="utilities">Utilidades</option>
              <option value="services">Serviços</option>
              <option value="supplies">Suprimentos</option>
              <option value="insurance">Seguro</option>
              <option value="taxes">Taxas/Impostos</option>
              <option value="other">Outros</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="documentNumber">
              Número do Documento
            </label>
            <input
              type="text"
              id="documentNumber"
              name="documentNumber"
              value={formData.documentNumber || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Número do documento (opcional)"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentMethod">
              Método de Pagamento
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Selecione...</option>
              <option value="cash">Dinheiro</option>
              <option value="bank_transfer">Transferência Bancária</option>
              <option value="credit_card">Cartão de Crédito</option>
              <option value="debit_card">Cartão de Débito</option>
              <option value="pix">PIX</option>
              <option value="check">Cheque</option>
            </select>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Salvando...' : bill?.id ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillPayForm;