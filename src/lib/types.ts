export type UserRole = 'Admin' | 'Gerente de Ventas' | 'Ejecutivo de Ventas' | 'Soporte' | 'Administrador comercial';

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
  id: string;
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
  issueDate: string;
  validUntil: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number; // as a decimal, e.g., 0.16
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
  type: PriceItemType;
  unit: PriceItemUnit;
  basePrice: number;
  lastUpdatedAt: string;
  status: PriceItemStatus;
};
