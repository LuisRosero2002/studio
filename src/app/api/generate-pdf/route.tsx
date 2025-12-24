import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { QuotePDFDocument } from '@/components/quotes/quote-pdf-document';
import type { Quote, Lead, User } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { quote, lead, user } = body as { quote: Lead, user?: User };

        console.log('Generating PDF for quote:', quote.quoteNumber);

        // Create React element using createElement
        const document = React.createElement(QuotePDFDocument, { quote, lead, user });

        // Render PDF to buffer
        const pdfBuffer = await renderToBuffer(document);

        console.log('PDF generated successfully, size:', pdfBuffer.length);

        // Return PDF as response
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="cotizacion-${quote.quoteNumber}.pdf"`,
                'Content-Length': pdfBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('PDF generation error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate PDF',
                details: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
