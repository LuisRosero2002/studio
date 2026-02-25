import jsPDF from 'jspdf';
import type { Quote, Lead, User } from '@/lib/types';

// Simple client-side PDF generation fallback
export async function generatePdf(quote: Quote, lead: Lead, user?: User): Promise<Blob> {
    const pdf = new jsPDF();

    // Add content
    pdf.setFontSize(20);
    pdf.text('COTIZACIÓN', 105, 20, { align: 'center' });

    pdf.setFontSize(12);
    pdf.text(`#${quote.quoteNumber}`, 105, 30, { align: 'center' });

    pdf.setFontSize(10);
    let y = 50;

    // Client info
    pdf.text('CLIENTE:', 20, y);
    y += 7;
    pdf.text(`${lead.contactName}`, 20, y);
    y += 5;
    pdf.text(`${lead.companyName}`, 20, y);
    y += 5;
    pdf.text(`${lead.contactEmail}`, 20, y);
    y += 10;

    // Quote details
    pdf.text(`Soluciones: ${quote.solutions?.join(', ')}`, 20, y);
    y += 7;
    pdf.text(`Fecha de Emisión: ${new Date(quote.issueDate).toLocaleDateString('es-MX')}`, 20, y);
    y += 7;
    pdf.text(`Válida Hasta: ${new Date(quote.validUntil).toLocaleDateString('es-MX')}`, 20, y);
    y += 15;

    // Items
    const renderItems = (title: string, items: any[]) => {
        if (!items || items.length === 0) return;
        pdf.text(`${title}:`, 20, y);
        y += 7;
        items.forEach(item => {
            pdf.text(`${item.description} - ${item.quantity} x ${item.currency === 'USD' ? '$' : 'COP '}${item.unitPrice.toLocaleString()}`, 25, y);
            y += 5;
        });
        y += 5;
    };

    renderItems('EQUIPOS (HARDWARE)', quote.hardwareItems);
    renderItems('COSTOS DE IMPLEMENTACIÓN', quote.installationItems);
    renderItems('SERVICIOS ADICIONALES', quote.serviceItems);

    // Totals
    y += 10;
    pdf.text(`Subtotal: ${quote.subtotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`, 20, y);
    y += 7;
    pdf.text(`IVA (19%): ${quote.tax.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`, 20, y);
    y += 7;
    pdf.setFontSize(12);
    pdf.text(`TOTAL: ${quote.total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`, 20, y);

    return pdf.output('blob');
}
