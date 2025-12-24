import { pdf } from '@react-pdf/renderer';
import { QuotePDFDocument } from '@/components/quotes/quote-pdf-document';
import type { Quote, Lead, User } from '@/lib/types';

export async function generatePdf(quote: Quote, lead: Lead, user?: User): Promise<Blob> {
  // Generate the PDF blob using JSX
  const blob = await pdf(<QuotePDFDocument quote={ quote } lead = { lead } user = { user } />).toBlob();
  return blob;
}
