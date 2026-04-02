// Componentes principais
export { default as ReservationList } from './components/ReservationList';
export { default as AreaCommonForm } from './components/AreaCommonForm';
export { default as ReservationForm } from './components/ReservationForm';
export { default as ReservationDashboard } from './components/ReservationDashboard';
export { default as ReservationModule } from './components/ReservationModule';

// Modelos
export { AreaComumModel, ReservaModel, AreaComumData, ReservaData } from './models/Reservation';

// Serviços
export { ReservationService, ReservationSummary } from './services/ReservationService';

// Tipos
export type { AreaComumData as AreaComum } from './models/Reservation';
export type { ReservaData as Reserva } from './models/Reservation';