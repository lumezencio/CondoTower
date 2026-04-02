// Componentes principais
export { default as ReportDashboard } from './components/ReportDashboard';
export { default as ReportGenerator } from './components/ReportGenerator';
export { default as ReportModule } from './components/ReportModule';

// Modelos
export { ReportService, ReportData, ReportFilter, GeneralReportData } from './models/Report';

// Serviços
export { ReportService as ReportServiceWithValidations } from './services/ReportService';

// Tipos
export type { ReportData as Report } from './models/Report';
export type { ReportFilter as ReportFilterType } from './models/Report';
export type { GeneralReportData as GeneralReportDataType } from './models/Report';