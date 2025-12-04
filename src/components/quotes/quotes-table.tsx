'use client';

import { MoreHorizontal, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { quotes, leads, users } from "@/lib/data"
import { QuoteStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { PDFDownloadLink } from '@react-pdf/renderer';
import { QuotePDFDocument } from './quote-pdf-document';
import { useState, useEffect } from "react";

const statusColors: Record<QuoteStatus, string> = {
  Borrador: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 border-gray-300",
  Enviada: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300",
  Aceptada: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300",
  Rechazada: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300",
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

// Helper component to avoid trying to render PDF on server
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};

export function QuotesTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Todas las Cotizaciones</CardTitle>
        <CardDescription>Una lista de todas las cotizaciones emitidas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cotización #</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">
                Total
              </TableHead>
              <TableHead className="hidden md:table-cell">
                Fecha de Emisión
              </TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((quote) => {
              const lead = leads.find(l => l.id === quote.leadId);
              const user = users.find(u => u.role === 'Ejecutivo de Ventas'); // Mock user
              if (!lead) return null;

              return (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                  <TableCell>
                    <div className="font-medium">{lead?.contactName}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {lead?.companyName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border", statusColors[quote.status])}>
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatCurrency(quote.total)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(quote.issueDate), 'd MMM, yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem>Ver</DropdownMenuItem>
                         <ClientOnly>
                          <PDFDownloadLink
                            document={<QuotePDFDocument quote={quote} lead={lead} user={user} />}
                            fileName={`cotizacion-${quote.quoteNumber}.pdf`}
                          >
                            {({ loading }) => (
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={loading}>
                                <Download className="mr-2 h-4 w-4" />
                                {loading ? 'Generando...' : 'Descargar PDF'}
                               </DropdownMenuItem>
                            )}
                          </PDFDownloadLink>
                        </ClientOnly>
                        <DropdownMenuItem>Enviar Correo</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
