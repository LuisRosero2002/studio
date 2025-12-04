import * as Comlink from 'comlink';
import { pdf } from '@react-pdf/renderer';
import { QuotePDFDocument } from '@/components/quotes/quote-pdf-document';
import type { Quote, Lead, User } from '@/lib/types';
import React from 'react';

const pdfWorker = {
  async generatePdf(quote: Quote, lead: Lead, user?: User): Promise<Blob> {
    const doc = React.createElement(QuotePDFDocument, { quote, lead, user });
    return await pdf(doc).toBlob();
  },
};

Comlink.expose(pdfWorker);
