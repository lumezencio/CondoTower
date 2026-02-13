import { PrismaClient, Pet as PrismaPet } from '@prisma/client';

export interface PetData {
  id?: string;
  nome: string;
  tipo: 'cao' | 'gato' | 'passaro' | 'outro';
  raca?: string;
  porte: 'pequeno' | 'medio' | 'grande';
  fotoUrl?: string;
  observacoes?: string;
  moradorId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PetModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: PetData): Promise<PetData> {
    const pet = await this.prisma.pet.create({
      data: {
        nome: data.nome,
        tipo: this.mapTipoToPrisma(data.tipo),
        raca: data.raca,
        porte: this.mapPorteToPrisma(data.porte),
        foto_url: data.fotoUrl,
        observacoes: data.observacoes,
        morador_id: data.moradorId,
      },
    });
    return this.mapPrismaToInterface(pet);
  }

  async findById(id: string): Promise<PetData | null> {
    const pet = await this.prisma.pet.findUnique({
      where: { id },
    });
    return pet ? this.mapPrismaToInterface(pet) : null;
  }

  async findAll(moradorId?: string, filters?: any): Promise<PetData[]> {
    const pets = await this.prisma.pet.findMany({
      where: {
        ...(moradorId && { morador_id: moradorId }),
        ...filters,
      },
      orderBy: {
        nome: 'asc',
      },
    });
    return pets.map(pet => this.mapPrismaToInterface(pet));
  }

  async update(id: string, data: Partial<PetData>): Promise<PetData> {
    const updatedPet = await this.prisma.pet.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return this.mapPrismaToInterface(updatedPet);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.pet.delete({
      where: { id },
    });
  }

  async getPetsByType(moradorId?: string, tipo: string = ''): Promise<PetData[]> {
    const pets = await this.prisma.pet.findMany({
      where: {
        ...(moradorId && { morador_id: moradorId }),
        ...(tipo && { tipo: this.mapTipoToPrisma(tipo) }),
      },
      orderBy: {
        nome: 'asc',
      },
    });
    return pets.map(pet => this.mapPrismaToInterface(pet));
  }

  async getPetsByPorte(moradorId?: string, porte: string = ''): Promise<PetData[]> {
    const pets = await this.prisma.pet.findMany({
      where: {
        ...(moradorId && { morador_id: moradorId }),
        ...(porte && { porte: this.mapPorteToPrisma(porte) }),
      },
      orderBy: {
        nome: 'asc',
      },
    });
    return pets.map(pet => this.mapPrismaToInterface(pet));
  }

  private mapPrismaToInterface(prismaPet: PrismaPet): PetData {
    return {
      id: prismaPet.id,
      nome: prismaPet.nome,
      tipo: this.mapTipoFromPrisma(prismaPet.tipo),
      raca: prismaPet.raca || undefined,
      porte: this.mapPorteFromPrisma(prismaPet.porte),
      fotoUrl: prismaPet.foto_url || undefined,
      observacoes: prismaPet.observacoes || undefined,
      moradorId: prismaPet.morador_id,
      createdAt: prismaPet.created_at,
      updatedAt: prismaPet.updated_at,
    };
  }

  private mapTipoToPrisma(tipo: string): string {
    switch(tipo) {
      case 'cao': return 'CAO';
      case 'gato': return 'GATO';
      case 'passaro': return 'PASSARO';
      case 'outro': return 'OUTRO';
      default: return 'OUTRO';
    }
  }

  private mapTipoFromPrisma(tipo: string): 'cao' | 'gato' | 'passaro' | 'outro' {
    switch(tipo) {
      case 'CAO': return 'cao';
      case 'GATO': return 'gato';
      case 'PASSARO': return 'passaro';
      case 'OUTRO': return 'outro';
      default: return 'outro';
    }
  }

  private mapPorteToPrisma(porte: string): string {
    switch(porte) {
      case 'pequeno': return 'PEQUENO';
      case 'medio': return 'MEDIO';
      case 'grande': return 'GRANDE';
      default: return 'MEDIO';
    }
  }

  private mapPorteFromPrisma(porte: string): 'pequeno' | 'medio' | 'grande' {
    switch(porte) {
      case 'PEQUENO': return 'pequeno';
      case 'MEDIO': return 'medio';
      case 'GRANDE': return 'grande';
      default: return 'medio';
    }
  }
}