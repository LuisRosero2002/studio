
'use client';

import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { quotes, leads, users } from "@/lib/data";
import { QuoteStatus } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PDFViewer } from "@react-pdf/renderer";
import { QuotePDFDocument } from "@/components/quotes/quote-pdf-document";
import { useEffect, useState } from "react";

const statusColors: Record<QuoteStatus, string> = {
  Borrador: "bg-gray-100 text-gray-800",
  Enviada: "bg-blue-100 text-blue-800",
  Aceptada: "bg-green-100 text-green-800",
  Rechazada: "bg-red-100 text-red-800",
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
};

export default function QuoteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const quote = quotes.find(q => q.id === params.id);
  if (!quote) {
    notFound();
  }

  const lead = leads.find(l => l.id === quote.leadId);
  if (!lead) {
    notFound();
  }
  const assignedUser = users.find(u => u.id === lead.assignedToId);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/quotes">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver a Cotizaciones
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight mt-4">
            Cotización #{quote.quoteNumber}
          </h1>
        </div>
        <div className="flex gap-2">
            <Button>
                <Mail className="mr-2 h-4 w-4" />
                Enviar por Correo
            </Button>
            <Button variant="secondary">
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
            </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Detalles</CardTitle>
                    <Badge className={statusColors[quote.status]}>{quote.status}</Badge>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                        <p className="text-muted-foreground">Fecha de Emisión:</p>
                        <p className="font-medium text-right">{format(new Date(quote.issueDate), 'd MMM, yyyy', { locale: es })}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <p className="text-muted-foreground">Válida Hasta:</p>
                        <p className="font-medium text-right">{format(new Date(quote.validUntil), 'd MMM, yyyy', { locale: es })}</p>
                    </div>
                     <div className="grid grid-cols-2 gap-2">
                        <p className="text-muted-foreground">Preparado por:</p>
                        <p className="font-medium text-right">{assignedUser?.name ?? 'N/A'}</p>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Cliente</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm">
                     <div className="grid grid-cols-2 gap-2">
                        <p className="text-muted-foreground">Compañía:</p>
                        <p className="font-medium text-right">{lead.companyName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <p className="text-muted-foreground">Contacto:</p>
                        <p className="font-medium text-right">{lead.contactName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <p className="text-muted-foreground">Correo:</p>
                        <p className="font-medium text-right">{lead.contactEmail}</p>
                    </div>
                     <div className="grid grid-cols-2 gap-2">
                        <p className="text-muted-foreground">Teléfono:</p>
                        <p className="font-medium text-right">{lead.contactPhone}</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Resumen Financiero</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(quote.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">IVA (16%)</span>
                        <span>{formatCurrency(quote.tax)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-base">
                        <span>Total</span>
                        <span>{formatCurrency(quote.total)}</span>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="h-[80vh]">
            <CardHeader>
                <CardTitle>Vista Previa del Documento</CardTitle>
            </CardHeader>
            <CardContent className="h-full pb-6">
                {isClient ? (
                    <PDFViewer width="100%" height="95%">
                        <QuotePDFDocument quote={quote} lead={lead} user={assignedUser} />
                    </PDFViewer>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p>Cargando previsualización...</p>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
