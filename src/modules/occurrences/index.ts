// Componentes principais
export { default as OccurrenceList } from './components/OccurrenceList';
export { default as OccurrenceForm } from './components/OccurrenceForm';
export { default as OccurrenceDashboard } from './components/OccurrenceDashboard';
export { default as OccurrenceModule } from './components/OccurrenceModule';

// Modelos
export { OcorrenciaModel, OcorrenciaData, OcorrenciaComentarioModel, OcorrenciaComentarioData } from './models/Ocorrencia';

// Serviços
export { OccurrenceService, OcorrenciaSummary } from './services/OccurrenceService';

// Tipos
export type { OcorrenciaData as Ocorrencia } from './models/Ocorrencia';
export type { OcorrenciaComentarioData as OcorrenciaComentario } from './models/Ocorrencia';