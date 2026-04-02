import { ReportService as BaseReportService } from './models/Report';

// Estendendo a classe base para adicionar validações e regras de negócio
export class ReportService extends BaseReportService {
  // Sobrescrevendo métodos para adicionar validações
  
  async generateFinancialReport(condominiumId: string, startDate: Date, endDate: Date): Promise<any> {
    this.validateReportParameters(condominiumId, startDate, endDate);
    return super.generateFinancialReport(condominiumId, startDate, endDate);
  }

  async generateCommunicationReport(condominiumId: string, userId: string, startDate: Date, endDate: Date): Promise<any> {
    this.validateReportParameters(condominiumId, startDate, endDate);
    if (!userId) {
      throw new Error('Usuário é obrigatório para relatório de comunicações');
    }
    return super.generateCommunicationReport(condominiumId, userId, startDate, endDate);
  }

  async generateDocumentReport(condominiumId: string, startDate: Date, endDate: Date): Promise<any> {
    this.validateReportParameters(condominiumId, startDate, endDate);
    return super.generateDocumentReport(condominiumId, startDate, endDate);
  }

  async generateOccurrenceReport(condominiumId: string, startDate: Date, endDate: Date): Promise<any> {
    this.validateReportParameters(condominiumId, startDate, endDate);
    return super.generateOccurrenceReport(condominiumId, startDate, endDate);
  }

  async generateReservationReport(condominiumId: string, startDate: Date, endDate: Date): Promise<any> {
    this.validateReportParameters(condominiumId, startDate, endDate);
    return super.generateReservationReport(condominiumId, startDate, endDate);
  }

  async generateDeliveryReport(condominiumId: string, startDate: Date, endDate: Date): Promise<any> {
    this.validateReportParameters(condominiumId, startDate, endDate);
    return super.generateDeliveryReport(condominiumId, startDate, endDate);
  }

  async generatePetReport(condominiumId: string, startDate: Date, endDate: Date): Promise<any> {
    this.validateReportParameters(condominiumId, startDate, endDate);
    return super.generatePetReport(condominiumId, startDate, endDate);
  }

  async generateMeetingReport(condominiumId: string, startDate: Date, endDate: Date): Promise<any> {
    this.validateReportParameters(condominiumId, startDate, endDate);
    return super.generateMeetingReport(condominiumId, startDate, endDate);
  }

  async generateGeneralReport(condominiumId: string, userId: string, startDate: Date, endDate: Date): Promise<any> {
    this.validateReportParameters(condominiumId, startDate, endDate);
    if (!userId) {
      throw new Error('Usuário é obrigatório para relatório geral');
    }
    return super.generateGeneralReport(condominiumId, userId, startDate, endDate);
  }

  // Validações
  private validateReportParameters(condominiumId: string, startDate: Date, endDate: Date): void {
    if (!condominiumId) {
      throw new Error('Condomínio é obrigatório');
    }

    if (!startDate || !endDate) {
      throw new Error('Período é obrigatório');
    }

    if (startDate > endDate) {
      throw new Error('Data de início não pode ser posterior à data de fim');
    }

    if (startDate > new Date()) {
      throw new Error('Data de início não pode ser futura');
    }

    if (endDate > new Date()) {
      throw new Error('Data de fim não pode ser futura');
    }

    // Verificar se o período não é muito longo (máximo de 2 anos)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 730) { // Mais de 2 anos
      throw new Error('Período máximo para relatório é de 2 anos');
    }
  }

  // Método para validar o formato de exportação
  async exportReport(reportData: any, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> {
    if (!reportData) {
      throw new Error('Dados do relatório são obrigatórios');
    }

    const validFormats: ('pdf' | 'excel' | 'csv')[] = ['pdf', 'excel', 'csv'];
    if (!validFormats.includes(format)) {
      throw new Error(`Formato de exportação inválido. Formatos válidos: ${validFormats.join(', ')}`);
    }

    // Chama o método da classe base
    return super.exportReport(reportData, format);
  }
}