import type { User, Lead, Activity, Quote } from './types';
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
  { id: 'user-2', name: 'Juan Perez', email: 'juan@wiga.com', avatarUrl: userImages['user-2'], role: 'Sales Manager' },
  { id: 'user-3', name: 'Ana Garcia', email: 'ana@wiga.com', avatarUrl: userImages['user-3'], role: 'Sales Executive' },
  { id: 'user-4', name: 'Carlos Sanchez', email: 'carlos@wiga.com', avatarUrl: userImages['user-4'], role: 'Sales Executive' },
];

export const leads: Lead[] = [
  { id: 'lead-1', companyName: 'Tech Solutions Inc.', contactName: 'John Doe', contactEmail: 'john.doe@techsolutions.com', contactPhone: '555-0101', source: 'Website', status: 'Proposal', assignedToId: 'user-3', purchaseProbability: 0.75, createdAt: formatISO(subDays(new Date(), 5)), lastContacted: formatISO(subDays(new Date(), 2)) },
  { id: 'lead-2', companyName: 'Innovate LLC', contactName: 'Jane Smith', contactEmail: 'jane.smith@innovate.com', contactPhone: '555-0102', source: 'Referral', status: 'Qualified', assignedToId: 'user-4', purchaseProbability: 0.60, createdAt: formatISO(subDays(new Date(), 10)), lastContacted: formatISO(subDays(new Date(), 3)) },
  { id: 'lead-3', companyName: 'Data Systems', contactName: 'Peter Jones', contactEmail: 'peter.jones@datasystems.com', contactPhone: '555-0103', source: 'Cold Call', status: 'Contacted', assignedToId: 'user-3', purchaseProbability: 0.25, createdAt: formatISO(subDays(new Date(), 2)), lastContacted: formatISO(subDays(new Date(), 1)) },
  { id: 'lead-4', companyName: 'Global Corp', contactName: 'Mary Johnson', contactEmail: 'mary.j@globalcorp.com', contactPhone: '555-0104', source: 'Advertisement', status: 'New', assignedToId: 'user-4', purchaseProbability: 0.10, createdAt: formatISO(subDays(new Date(), 1)), lastContacted: formatISO(subDays(new Date(), 1)) },
  { id: 'lead-5', companyName: 'Creative Minds', contactName: 'David Williams', contactEmail: 'david@creativeminds.com', contactPhone: '555-0105', source: 'Website', status: 'Won', assignedToId: 'user-3', purchaseProbability: 1, createdAt: formatISO(subDays(new Date(), 30)), lastContacted: formatISO(subDays(new Date(), 15)) },
  { id: 'lead-6', companyName: 'SecureNet', contactName: 'Linda Brown', contactEmail: 'linda.b@securenet.com', contactPhone: '555-0106', source: 'Referral', status: 'Lost', assignedToId: 'user-4', purchaseProbability: 0, createdAt: formatISO(subDays(new Date(), 25)), lastContacted: formatISO(subDays(new Date(), 20)) },
];

export const activities: Activity[] = [
  { id: 'act-1', leadId: 'lead-1', type: 'Email', date: formatISO(subDays(new Date(), 5)), notes: 'Sent initial introductory email with company brochure.', userId: 'user-3' },
  { id: 'act-2', leadId: 'lead-1', type: 'Call', date: formatISO(subDays(new Date(), 4)), notes: 'Follow-up call. Discussed pain points and scheduled a demo.', userId: 'user-3' },
  { id: 'act-3', leadId: 'lead-1', type: 'Meeting', date: formatISO(subDays(new Date(), 3)), notes: 'Product demo meeting. Went well, client is interested in custom solution.', userId: 'user-3' },
  { id: 'act-4', leadId: 'lead-1', type: 'Email', date: formatISO(subDays(new Date(), 2)), notes: 'Sent proposal Q-2024-001 as requested.', userId: 'user-3' },
  { id: 'act-5', leadId: 'lead-2', type: 'Call', date: formatISO(subDays(new Date(), 8)), notes: 'Initial call based on referral. Good conversation.', userId: 'user-4' },
  { id: 'act-6', leadId: 'lead-2', type: 'Meeting', date: formatISO(subDays(new Date(), 3)), notes: 'Met with Jane to qualify the lead. They have budget and authority.', userId: 'user-4' },
];

export const quotes: Quote[] = [
    { id: 'quote-1', quoteNumber: 'Q-2024-001', leadId: 'lead-1', issueDate: formatISO(subDays(new Date(), 2)), validUntil: formatISO(new Date(new Date().setDate(new Date().getDate() + 28))), items: [
        { id: 'item-1', description: 'Enterprise Software License', quantity: 50, unitPrice: 250, total: 12500 },
        { id: 'item-2', description: 'Premium Support Package (1 Year)', quantity: 1, unitPrice: 3000, total: 3000 },
    ], subtotal: 15500, tax: 2480, total: 17980, status: 'Sent' },
    { id: 'quote-2', quoteNumber: 'Q-2024-002', leadId: 'lead-5', issueDate: formatISO(subDays(new Date(), 20)), validUntil: formatISO(subDays(new Date(), -10)), items: [
        { id: 'item-3', description: 'Web Design and Development', quantity: 1, unitPrice: 8000, total: 8000 },
    ], subtotal: 8000, tax: 1280, total: 9280, status: 'Accepted' },
];

export function getUserById(id: string) {
  return users.find(u => u.id === id);
}
