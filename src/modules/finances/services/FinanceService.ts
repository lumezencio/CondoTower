import { BillReceiveModel, BillReceiveData } from './models/BillReceive';
import { BillPayModel, BillPayData } from './models/BillPay';

export interface FinancialSummary {
  totalReceivable: number;
  totalReceived: number;
  totalPayable: number;
  totalPaid: number;
  balance: number;
  overdueReceivables: number;
  overduePayables: number;
}

export class FinanceService {
  private billReceiveModel: BillReceiveModel;
  private billPayModel: BillPayModel;

  constructor() {
    this.billReceiveModel = new BillReceiveModel();
    this.billPayModel = new BillPayModel();
  }

  // Métodos para Contas a Receber
  async createBillReceive(data: BillReceiveData): Promise<BillReceiveData> {
    // Validação de dados
    this.validateBillReceiveData(data);
    return await this.billReceiveModel.create(data);
  }

  async getBillReceiveById(id: string): Promise<BillReceiveData | null> {
    return await this.billReceiveModel.findById(id);
  }

  async getAllBillsReceive(condominiumId: string, filters?: any): Promise<BillReceiveData[]> {
    return await this.billReceiveModel.findAll(condominiumId, filters);
  }

  async updateBillReceive(id: string, data: Partial<BillReceiveData>): Promise<BillReceiveData> {
    // Validação de dados se campos importantes forem atualizados
    if (data.title || data.amount || data.dueDate) {
      const currentBill = await this.billReceiveModel.findById(id);
      if (currentBill) {
        const updatedData = { ...currentBill, ...data } as BillReceiveData;
        this.validateBillReceiveData(updatedData);
      }
    }
    return await this.billReceiveModel.update(id, data);
  }

  async deleteBillReceive(id: string): Promise<void> {
    await this.billReceiveModel.delete(id);
  }

  async markBillReceiveAsReceived(id: string, receivedBy: string): Promise<BillReceiveData> {
    return await this.billReceiveModel.markAsReceived(id, receivedBy);
  }

  // Métodos para Contas a Pagar
  async createBillPay(data: BillPayData): Promise<BillPayData> {
    // Validação de dados
    this.validateBillPayData(data);
    return await this.billPayModel.create(data);
  }

  async getBillPayById(id: string): Promise<BillPayData | null> {
    return await this.billPayModel.findById(id);
  }

  async getAllBillsPay(condominiumId: string, filters?: any): Promise<BillPayData[]> {
    return await this.billPayModel.findAll(condominiumId, filters);
  }

  async updateBillPay(id: string, data: Partial<BillPayData>): Promise<BillPayData> {
    // Validação de dados se campos importantes forem atualizados
    if (data.title || data.amount || data.dueDate) {
      const currentBill = await this.billPayModel.findById(id);
      if (currentBill) {
        const updatedData = { ...currentBill, ...data } as BillPayData;
        this.validateBillPayData(updatedData);
      }
    }
    return await this.billPayModel.update(id, data);
  }

  async deleteBillPay(id: string): Promise<void> {
    await this.billPayModel.delete(id);
  }

  async markBillPayAsPaid(id: string, paidBy: string): Promise<BillPayData> {
    return await this.billPayModel.markAsPaid(id, paidBy);
  }

  // Métodos de resumo financeiro
  async getFinancialSummary(condominiumId: string): Promise<FinancialSummary> {
    const [receivables, payables, overdueReceivables, overduePayables] = await Promise.all([
      this.getAllBillsReceive(condominiumId),
      this.getAllBillsPay(condominiumId),
      this.billReceiveModel.getOverdueBills(condominiumId),
      this.billPayModel.getOverdueBills(condominiumId),
    ]);

    const totalReceivable = receivables.reduce((sum, bill) => sum + bill.amount, 0);
    const totalReceived = receivables
      .filter(bill => bill.status === 'received')
      .reduce((sum, bill) => sum + bill.amount, 0);
    
    const totalPayable = payables.reduce((sum, bill) => sum + bill.amount, 0);
    const totalPaid = payables
      .filter(bill => bill.status === 'paid')
      .reduce((sum, bill) => sum + bill.amount, 0);

    const balance = totalReceived - totalPaid;

    return {
      totalReceivable,
      totalReceived,
      totalPayable,
      totalPaid,
      balance,
      overdueReceivables: overdueReceivables.length,
      overduePayables: overduePayables.length,
    };
  }

  // Método para obter relatório financeiro
  async getFinancialReport(
    condominiumId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ receivables: BillReceiveData[], payables: BillPayData[] }> {
    const [receivables, payables] = await Promise.all([
      this.getAllBillsReceive(condominiumId, {
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      }),
      this.getAllBillsPay(condominiumId, {
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      }),
    ]);

    return { receivables, payables };
  }

  // Validações
  private validateBillReceiveData(data: BillReceiveData): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Título é obrigatório');
    }

    if (data.amount <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }

    if (!data.dueDate) {
      throw new Error('Data de vencimento é obrigatória');
    }

    if (data.dueDate < new Date()) {
      throw new Error('Data de vencimento não pode ser anterior à data atual');
    }

    if (data.amount.toString().split('.')[1]?.length > 2) {
      throw new Error('Valor não pode ter mais de 2 casas decimais');
    }
  }

  private validateBillPayData(data: BillPayData): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Título é obrigatório');
    }

    if (data.amount <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }

    if (!data.dueDate) {
      throw new Error('Data de vencimento é obrigatória');
    }

    if (data.dueDate < new Date()) {
      throw new Error('Data de vencimento não pode ser anterior à data atual');
    }

    if (data.amount.toString().split('.')[1]?.length > 2) {
      throw new Error('Valor não pode ter mais de 2 casas decimais');
    }
  }
}