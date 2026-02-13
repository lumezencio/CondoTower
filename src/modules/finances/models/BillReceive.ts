import { PrismaClient, BillReceive as PrismaBillReceive } from '@prisma/client';

export interface BillReceiveData {
  id?: string;
  title: string;
  description?: string;
  amount: number;
  dueDate: Date;
  receivedDate?: Date;
  status: 'pending' | 'received' | 'overdue';
  condominiumId: string;
  unitId?: string;
  receivedBy?: string;
  paymentMethod?: string;
  documentNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BillReceiveModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: BillReceiveData): Promise<BillReceiveData> {
    const bill = await this.prisma.billReceive.create({
      data: {
        title: data.title,
        description: data.description,
        amount: data.amount,
        dueDate: data.dueDate,
        status: data.status || 'pending',
        condominiumId: data.condominiumId,
        unitId: data.unitId,
        receivedBy: data.receivedBy,
        paymentMethod: data.paymentMethod,
        documentNumber: data.documentNumber,
      },
    });
    return this.mapPrismaToInterface(bill);
  }

  async findById(id: string): Promise<BillReceiveData | null> {
    const bill = await this.prisma.billReceive.findUnique({
      where: { id },
    });
    return bill ? this.mapPrismaToInterface(bill) : null;
  }

  async findAll(condominiumId: string, filters?: any): Promise<BillReceiveData[]> {
    const bills = await this.prisma.billReceive.findMany({
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

  async update(id: string, data: Partial<BillReceiveData>): Promise<BillReceiveData> {
    const updatedBill = await this.prisma.billReceive.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedBill);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.billReceive.delete({
      where: { id },
    });
  }

  async markAsReceived(id: string, receivedBy: string): Promise<BillReceiveData> {
    const updatedBill = await this.prisma.billReceive.update({
      where: { id },
      data: {
        status: 'RECEIVED',
        receivedDate: new Date(),
        receivedBy,
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedBill);
  }

  async getOverdueBills(condominiumId: string): Promise<BillReceiveData[]> {
    const bills = await this.prisma.billReceive.findMany({
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

  private mapPrismaToInterface(prismaBill: PrismaBillReceive): BillReceiveData {
    return {
      id: prismaBill.id,
      title: prismaBill.title,
      description: prismaBill.description || undefined,
      amount: Number(prismaBill.amount),
      dueDate: prismaBill.dueDate,
      receivedDate: prismaBill.receivedDate || undefined,
      status: this.mapStatusFromPrisma(prismaBill.status),
      condominiumId: prismaBill.condominiumId,
      unitId: prismaBill.unitId || undefined,
      receivedBy: prismaBill.receivedBy || undefined,
      paymentMethod: prismaBill.paymentMethod || undefined,
      documentNumber: prismaBill.documentNumber || undefined,
      createdAt: prismaBill.createdAt,
      updatedAt: prismaBill.updatedAt,
    };
  }

  private mapStatusFromPrisma(status: string): 'pending' | 'received' | 'overdue' {
    switch(status) {
      case 'RECEIVED':
        return 'received';
      case 'OVERDUE':
        return 'overdue';
      default:
        return 'pending';
    }
  }
}