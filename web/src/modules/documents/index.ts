// Componentes principais
export { default as DocumentList } from './components/DocumentList';
export { default as DocumentForm } from './components/DocumentForm';
export { default as DocumentDashboard } from './components/DocumentDashboard';
export { default as DocumentModule } from './components/DocumentModule';

// Modelos
export { DocumentoModel, DocumentoData } from './models/Documento';

// Serviços
export { DocumentService, DocumentoSummary } from './services/DocumentService';

// Tipos
export type { DocumentoData as Documento } from './models/Documento';