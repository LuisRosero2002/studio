import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Quote, Lead, User } from '@/lib/types';

export async function generatePdfFromHTML(elementId: string, filename: string): Promise<Blob> {
    try {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with id "${elementId}" not found`);
        }

        // Capture the element as canvas
        const canvas = await html2canvas(element, {
            scale: 2, // Higher quality
            useCORS: true,
            logging: false,
        });

        // Create PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add additional pages if needed
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Convert to blob
        return pdf.output('blob');
    } catch (error) {
        console.error('PDF generation error:', error);
        throw error;
    }
}

// Simple client-side PDF generation
export async function generatePdf(quote: Quote, lead: Lead, user?: User): Promise<Blob> {
    // For now, we'll use a simpler approach - just create a basic PDF with text
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
    pdf.text(`Solución: ${quote.solution}`, 20, y);
    y += 7;
    pdf.text(`Fecha de Emisión: ${new Date(quote.issueDate).toLocaleDateString('es-MX')}`, 20, y);
    y += 7;
    pdf.text(`Válida Hasta: ${new Date(quote.validUntil).toLocaleDateString('es-MX')}`, 20, y);
    y += 15;

    // Items
    if (quote.hardwareItems?.length > 0) {
        pdf.text('EQUIPOS (HARDWARE):', 20, y);
        y += 7;
        quote.hardwareItems.forEach(item => {
            pdf.text(`${item.description} - ${item.quantity} x $${item.unitPrice.toFixed(2)}`, 25, y);
            y += 5;
        });
        y += 5;
    }

    if (quote.installationItems?.length > 0) {
        pdf.text('COSTOS DE IMPLEMENTACIÓN:', 20, y);
        y += 7;
        quote.installationItems.forEach(item => {
            pdf.text(`${item.description} - ${item.quantity} x $${item.unitPrice.toFixed(2)}`, 25, y);
            y += 5;
        });
        y += 5;
    }

    if (quote.serviceItems?.length > 0) {
        pdf.text('SERVICIOS ADICIONALES:', 20, y);
        y += 7;
        quote.serviceItems.forEach(item => {
            pdf.text(`${item.description} - ${item.quantity} x $${item.unitPrice.toFixed(2)}`, 25, y);
            y += 5;
        });
        y += 5;
    }

    // Totals
    y += 10;
    pdf.text(`Subtotal: $${quote.subtotal.toFixed(2)}`, 20, y);
    y += 7;
    pdf.text(`IVA (16%): $${quote.tax.toFixed(2)}`, 20, y);
    y += 7;
    pdf.setFontSize(12);
    pdf.text(`TOTAL: $${quote.total.toFixed(2)}`, 20, y);

    return pdf.output('blob');
}
