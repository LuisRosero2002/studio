import type { User, Lead, Activity, Quote, PriceItem } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { subDays, formatISO } from 'date-fns';

const userImages = {
  'user-1': PlaceHolderImages.find(img => img.id === 'user-avatar-1')?.imageUrl ?? '',
  'user-2': PlaceHolderImages.find(img => img.id === 'user-avatar-2')?.imageUrl ?? '',
  'user-3': PlaceHolderImages.find(img => img.id === 'user-avatar-3')?.imageUrl ?? '',
  'user-4': PlaceHolderImages.find(img => img.id === 'user-avatar-4')?.imageUrl ?? '',
};

export const users: User[] = [
  { id: 'user-1', name: 'Maria Rodriguez', email: 'maria@wiga.com', avatarUrl: userImages['user-1'], role: 'Admin' },
  { id: 'user-2', name: 'Juan Perez', email: 'juan@wiga.com', avatarUrl: userImages['user-2'], role: 'Gerente de Ventas' },
  { id: 'user-3', name: 'Ana Garcia', email: 'ana@wiga.com', avatarUrl: userImages['user-3'], role: 'Ejecutivo de Ventas' },
  { id: 'user-4', name: 'Carlos Sanchez', email: 'carlos@wiga.com', avatarUrl: userImages['user-4'], role: 'Ejecutivo de Ventas' },
];

export const leads: Lead[] = [
  { id: 'lead-1', companyName: 'Tech Solutions Inc.', contactName: 'John Doe', contactEmail: 'john.doe@techsolutions.com', contactPhone: '555-0101', source: 'Sitio Web', status: 'Propuesta', assignedToId: 'user-3', purchaseProbability: 0.75, createdAt: formatISO(subDays(new Date(), 5)), lastContacted: formatISO(subDays(new Date(), 2)) },
  { id: 'lead-2', companyName: 'Innovate LLC', contactName: 'Jane Smith', contactEmail: 'jane.smith@innovate.com', contactPhone: '555-0102', source: 'Referido', status: 'Calificado', assignedToId: 'user-4', purchaseProbability: 0.60, createdAt: formatISO(subDays(new Date(), 10)), lastContacted: formatISO(subDays(new Date(), 3)) },
  { id: 'lead-3', companyName: 'Data Systems', contactName: 'Peter Jones', contactEmail: 'peter.jones@datasystems.com', contactPhone: '555-0103', source: 'Llamada en Frío', status: 'Contactado', assignedToId: 'user-3', purchaseProbability: 0.25, createdAt: formatISO(subDays(new Date(), 2)), lastContacted: formatISO(subDays(new Date(), 1)) },
  { id: 'lead-4', companyName: 'Global Corp', contactName: 'Mary Johnson', contactEmail: 'mary.j@globalcorp.com', contactPhone: '555-0104', source: 'Publicidad', status: 'Nuevo', assignedToId: 'user-4', purchaseProbability: 0.10, createdAt: formatISO(subDays(new Date(), 1)), lastContacted: formatISO(subDays(new Date(), 1)) },
  { id: 'lead-5', companyName: 'Creative Minds', contactName: 'David Williams', contactEmail: 'david@creativeminds.com', contactPhone: '555-0105', source: 'Sitio Web', status: 'Ganado', assignedToId: 'user-3', purchaseProbability: 1, createdAt: formatISO(subDays(new Date(), 30)), lastContacted: formatISO(subDays(new Date(), 15)) },
  { id: 'lead-6', companyName: 'SecureNet', contactName: 'Linda Brown', contactEmail: 'linda.b@securenet.com', contactPhone: '555-0106', source: 'Referido', status: 'Perdido', assignedToId: 'user-4', purchaseProbability: 0, createdAt: formatISO(subDays(new Date(), 25)), lastContacted: formatISO(subDays(new Date(), 20)) },
];

export const activities: Activity[] = [
  { id: 'act-1', leadId: 'lead-1', type: 'Email', date: formatISO(subDays(new Date(), 5)), notes: 'Se envió correo de introducción con brochure de la empresa.', userId: 'user-3' },
  { id: 'act-2', leadId: 'lead-1', type: 'Llamada', date: formatISO(subDays(new Date(), 4)), notes: 'Llamada de seguimiento. Se discutieron puntos de dolor y se agendó una demo.', userId: 'user-3' },
  { id: 'act-3', leadId: 'lead-1', type: 'Reunión', date: formatISO(subDays(new Date(), 3)), notes: 'Reunión para demo de producto. Salió bien, cliente interesado en solución a medida.', userId: 'user-3' },
  { id: 'act-4', leadId: 'lead-1', type: 'Email', date: formatISO(subDays(new Date(), 2)), notes: 'Se envió la propuesta Q-2024-001 como se solicitó.', userId: 'user-3' },
  { id: 'act-5', leadId: 'lead-2', type: 'Llamada', date: formatISO(subDays(new Date(), 8)), notes: 'Llamada inicial basada en referido. Buena conversación.', userId: 'user-4' },
  { id: 'act-6', leadId: 'lead-2', type: 'Reunión', date: formatISO(subDays(new Date(), 3)), notes: 'Reunión con Jane para calificar el prospecto. Tienen presupuesto y autoridad.', userId: 'user-4' },
];

export const quotes: Quote[] = [
    { id: 'quote-1', quoteNumber: 'Q-2024-001', leadId: 'lead-1', issueDate: formatISO(subDays(new Date(), 2)), validUntil: formatISO(new Date(new Date().setDate(new Date().getDate() + 28))), items: [
        { id: 'item-1', description: 'Licencia de Software Empresarial', quantity: 50, unitPrice: 250, total: 12500 },
        { id: 'item-2', description: 'Paquete de Soporte Premium (1 Año)', quantity: 1, unitPrice: 3000, total: 3000 },
    ], subtotal: 15500, tax: 2480, total: 17980, status: 'Enviada' },
    { id: 'quote-2', quoteNumber: 'Q-2024-002', leadId: 'lead-5', issueDate: formatISO(subDays(new Date(), 20)), validUntil: formatISO(subDays(new Date(), -10)), items: [
        { id: 'item-3', description: 'Diseño y Desarrollo Web', quantity: 1, unitPrice: 8000, total: 8000 },
    ], subtotal: 8000, tax: 1280, total: 9280, status: 'Aceptada' },
];

export const priceItems: PriceItem[] = [
  { id: 'price-1', name: 'Sensor de Humedad de Suelo', description: 'Sensor para medir la humedad del suelo en tiempo real.', type: 'Hardware', unit: 'Por unidad', basePrice: 150, lastUpdatedAt: formatISO(subDays(new Date(), 10)), status: 'Activo' },
  { id: 'price-2', name: 'Soporte Técnico Estándar', description: 'Soporte técnico remoto durante horas hábiles.', type: 'Servicio', unit: 'Mensual', basePrice: 200, lastUpdatedAt: formatISO(subDays(new Date(), 5)), status: 'Activo' },
  { id: 'price-3', name: 'Instalación de Sistema Básico', description: 'Instalación y configuración de hasta 5 sensores.', type: 'Instalación', unit: 'Por instalación', basePrice: 500, lastUpdatedAt: formatISO(subDays(new Date(), 15)), status: 'Activo' },
  { id: 'price-4', name: 'Módulo IoT Agrícola', description: 'Módulo de comunicación para transmisión de datos.', type: 'Hardware', unit: 'Por unidad', basePrice: 300, lastUpdatedAt: formatISO(subDays(new Date(), 20)), status: 'Activo' },
  { id: 'price-5', name: 'Monitoreo de Cultivos', description: 'Servicio de monitoreo y alertas 24/7.', type: 'Servicio', unit: 'Anual', basePrice: 2400, lastUpdatedAt: formatISO(subDays(new Date(), 8)), status: 'Activo' },
  { id: 'price-6', name: 'Desarrollo Personalizado', description: 'Horas de desarrollo para funcionalidades a medida.', type: 'Servicio', unit: 'Por hora', basePrice: 100, lastUpdatedAt: formatISO(subDays(new Date(), 3)), status: 'Inactivo' },
];

export function getUserById(id: string) {
  return users.find(u => u.id === id);
}
