export type UserRole = 'Admin' | 'Administrador comercial' | 'Ejecutivo de Ventas' | 'Soporte';

export type WithId<T> = T & { id: string };

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
};

export type LeadStatus = 'Nuevo' | 'Contactado' | 'Calificado' | 'Propuesta' | 'Ganado' | 'Perdido';

export type Lead = {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  source: string;
  status: LeadStatus;
  assignedToId: string;
  purchaseProbability: number; // 0 to 1
  solutionInterest?: string;
  createdAt: string;
  lastContacted: string;
};

export type ActivityType = 'Llamada' | 'Visita' | 'Email' | 'Reunión';

export type Activity = {
  id: string;
  leadId: string;
  type: ActivityType;
  date: string;
  notes: string;
  userId: string;
};

export type QuoteItem = {
  priceItemId: string; // Link to the original PriceItem
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type QuoteStatus = 'Borrador' | 'Enviada' | 'Aceptada' | 'Rechazada';

export type Quote = {
  id: string;
  quoteNumber: string;
  leadId: string;
  solution: string;
  issueDate: string;
  validUntil: string;
  hardwareItems: QuoteItem[];
  installationItems: QuoteItem[];
  serviceItems: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: QuoteStatus;
};

export type PriceItemType = 'Hardware' | 'Servicio' | 'Instalación';
export type PriceItemUnit = 'Por unidad' | 'Por hora' | 'Por instalación' | 'Mensual' | 'Anual';
export type PriceItemStatus = 'Activo' | 'Inactivo';

export type PriceItem = {
  id: string;
  name: string;
  description: string;
  solution: string;
  type: PriceItemType;
  unit: PriceItemUnit;
  basePrice: number;
  lastUpdatedAt: string;
  status: PriceItemStatus;
};
