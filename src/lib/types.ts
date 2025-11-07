export type UserRole = 'Admin' | 'Sales Manager' | 'Sales Executive' | 'Support';

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
};

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';

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

export type ActivityType = 'Call' | 'Visit' | 'Email' | 'Meeting';

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

export type QuoteStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected';

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
