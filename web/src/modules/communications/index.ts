// Componentes principais
export { default as ComunicadoList } from './components/ComunicadoList';
export { default as ComunicadoForm } from './components/ComunicadoForm';
export { default as CommunicationDashboard } from './components/CommunicationDashboard';
export { default as CommunicationModule } from './components/CommunicationModule';

// Modelos
export { ComunicadoModel, ComunicadoData } from './models/Comunicado';
export { ComunicadoLeituraModel, ComunicadoLeituraData } from './models/ComunicadoLeitura';

// Serviços
export { CommunicationService, ComunicadoSummary } from './services/CommunicationService';

// Tipos
export type { ComunicadoData as Comunicado } from './models/Comunicado';
export type { ComunicadoLeituraData as ComunicadoLeitura } from './models/ComunicadoLeitura';