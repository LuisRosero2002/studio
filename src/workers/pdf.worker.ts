import * as Comlink from 'comlink';
import { pdf } from '@react-pdf/renderer';
import { QuotePDFDocument } from '@/components/quotes/quote-pdf-document';
import type { Quote, Lead, User } from '@/lib/types';
import React from 'react';

const pdfWorker = {
  async generatePdf(quote: Quote, lead: Lead, user?: User): Promise<Blob> {
    // We must use React.createElement here as JSX is not compiled in the worker
    const doc = React.createElement(QuotePDFDocument, { quote, lead, user });
    return await pdf(doc).toBlob();
  },
};

Comlink.expose(pdfWorker);

// This ensures TypeScript treats this file as a module.
export {};
