import { PrismaClient, BillPay as PrismaBillPay } from '@prisma/client';

export interface BillPayData {
  id?: string;
  title: string;
  description?: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  condominiumId: string;
  supplierId?: string;
  paidBy?: string;
  paymentMethod?: string;
  documentNumber?: string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BillPayModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: BillPayData): Promise<BillPayData> {
    const bill = await this.prisma.billPay.create({
      data: {
        title: data.title,
        description: data.description,
        amount: data.amount,
        dueDate: data.dueDate,
        status: data.status || 'pending',
        condominiumId: data.condominiumId,
        supplierId: data.supplierId,
        paidBy: data.paidBy,
        paymentMethod: data.paymentMethod,
        documentNumber: data.documentNumber,
        category: data.category,
      },
    });
    return this.mapPrismaToInterface(bill);
  }

  async findById(id: string): Promise<BillPayData | null> {
    const bill = await this.prisma.billPay.findUnique({
      where: { id },
    });
    return bill ? this.mapPrismaToInterface(bill) : null;
  }

  async findAll(condominiumId: string, filters?: any): Promise<BillPayData[]> {
    const bills = await this.prisma.billPay.findMany({
      where: {
        condominiumId,
        ...filters,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
    return bills.map(bill => this.mapPrismaToInterface(bill));
  }

  async update(id: string, data: Partial<BillPayData>): Promise<BillPayData> {
    const updatedBill = await this.prisma.billPay.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedBill);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.billPay.delete({
      where: { id },
    });
  }

  async markAsPaid(id: string, paidBy: string): Promise<BillPayData> {
    const updatedBill = await this.prisma.billPay.update({
      where: { id },
      data: {
        status: 'PAID',
        paidDate: new Date(),
        paidBy,
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedBill);
  }

  async getOverdueBills(condominiumId: string): Promise<BillPayData[]> {
    const bills = await this.prisma.billPay.findMany({
      where: {
        condominiumId,
        status: 'PENDING',
        dueDate: {
          lt: new Date(),
        },
      },
    });
    return bills.map(bill => this.mapPrismaToInterface(bill));
  }

  private mapPrismaToInterface(prismaBill: PrismaBillPay): BillPayData {
    return {
      id: prismaBill.id,
      title: prismaBill.title,
      description: prismaBill.description || undefined,
      amount: Number(prismaBill.amount),
      dueDate: prismaBill.dueDate,
      paidDate: prismaBill.paidDate || undefined,
      status: this.mapStatusFromPrisma(prismaBill.status),
      condominiumId: prismaBill.condominiumId,
      supplierId: prismaBill.supplierId || undefined,
      paidBy: prismaBill.paidBy || undefined,
      paymentMethod: prismaBill.paymentMethod || undefined,
      documentNumber: prismaBill.documentNumber || undefined,
      category: prismaBill.category || undefined,
      createdAt: prismaBill.createdAt,
      updatedAt: prismaBill.updatedAt,
    };
  }

  private mapStatusFromPrisma(status: string): 'pending' | 'paid' | 'overdue' | 'cancelled' {
    switch(status) {
      case 'PAID':
        return 'paid';
      case 'OVERDUE':
        return 'overdue';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
}