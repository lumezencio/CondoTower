import { PetModel, PetData } from './models/Pet';

export interface PetSummary {
  total: number;
  byType: {
    cao: number;
    gato: number;
    passaro: number;
    outro: number;
  };
  byPorte: {
    pequeno: number;
    medio: number;
    grande: number;
  };
}

export class PetService {
  private petModel: PetModel;

  constructor() {
    this.petModel = new PetModel();
  }

  // Métodos para Pets
  async createPet(data: PetData): Promise<PetData> {
    // Validação de dados
    this.validatePetData(data);
    return await this.petModel.create(data);
  }

  async getPetById(id: string): Promise<PetData | null> {
    return await this.petModel.findById(id);
  }

  async getAllPets(moradorId?: string, filters?: any): Promise<PetData[]> {
    return await this.petModel.findAll(moradorId, filters);
  }

  async updatePet(id: string, data: Partial<PetData>): Promise<PetData> {
    // Validação de dados se campos importantes forem atualizados
    if (data.nome || data.tipo || data.porte || data.raca) {
      const currentPet = await this.petModel.findById(id);
      if (currentPet) {
        const updatedData = { ...currentPet, ...data } as PetData;
        this.validatePetData(updatedData);
      }
    }
    return await this.petModel.update(id, data);
  }

  async deletePet(id: string): Promise<void> {
    await this.petModel.delete(id);
  }

  async getPetsByType(moradorId?: string, tipo: string = ''): Promise<PetData[]> {
    return await this.petModel.getPetsByType(moradorId, tipo);
  }

  async getPetsByPorte(moradorId?: string, porte: string = ''): Promise<PetData[]> {
    return await this.petModel.getPetsByPorte(moradorId, porte);
  }

  // Método para obter resumo de pets
  async getPetSummary(moradorId?: string): Promise<PetSummary> {
    const pets = await this.getAllPets(moradorId);
    
    const total = pets.length;
    
    const byType = {
      cao: pets.filter(p => p.tipo === 'cao').length,
      gato: pets.filter(p => p.tipo === 'gato').length,
      passaro: pets.filter(p => p.tipo === 'passaro').length,
      outro: pets.filter(p => p.tipo === 'outro').length,
    };
    
    const byPorte = {
      pequeno: pets.filter(p => p.porte === 'pequeno').length,
      medio: pets.filter(p => p.porte === 'medio').length,
      grande: pets.filter(p => p.porte === 'grande').length,
    };

    return {
      total,
      byType,
      byPorte,
    };
  }

  // Validações
  private validatePetData(data: PetData): void {
    if (!data.nome || data.nome.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }

    if (data.nome.trim().length > 50) {
      throw new Error('Nome não pode ter mais de 50 caracteres');
    }

    if (!data.tipo) {
      throw new Error('Tipo é obrigatório');
    }

    const validTypes: (PetData['tipo'])[] = ['cao', 'gato', 'passaro', 'outro'];
    if (!validTypes.includes(data.tipo)) {
      throw new Error(`Tipo inválido. Os tipos válidos são: ${validTypes.join(', ')}`);
    }

    if (!data.porte) {
      throw new Error('Porte é obrigatório');
    }

    const validPortes: (PetData['porte'])[] = ['pequeno', 'medio', 'grande'];
    if (!validPortes.includes(data.porte)) {
      throw new Error(`Porte inválido. Os portes válidos são: ${validPortes.join(', ')}`);
    }

    if (data.raca && data.raca.length > 50) {
      throw new Error('Raça não pode ter mais de 50 caracteres');
    }

    if (data.observacoes && data.observacoes.length > 200) {
      throw new Error('Observações não podem ter mais de 200 caracteres');
    }

    if (!data.moradorId) {
      throw new Error('Morador é obrigatório');
    }

    // Regras de negócio específicas
    if (data.tipo === 'outro' && !data.observacoes) {
      throw new Error('Para pets do tipo "outro", é necessário informar observações');
    }

    // Validar URL da foto se fornecida
    if (data.fotoUrl) {
      try {
        new URL(data.fotoUrl);
      } catch (e) {
        throw new Error('URL da foto inválida');
      }
    }
  }
}