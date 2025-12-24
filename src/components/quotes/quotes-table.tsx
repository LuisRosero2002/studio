'use client';

import { MoreHorizontal, Download, Loader2, Eye } from "lucide-react"
import Link from "next/link"
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type Quote, QuoteStatus, Lead, User } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState, useEffect } from "react";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, getDoc, query } from "firebase/firestore"
import { Skeleton } from "../ui/skeleton"
import { FirestorePermissionError } from "@/firebase/errors"
import { errorEmitter } from "@/firebase/error-emitter"
import { generatePdf } from "@/lib/generate-pdf"

const statusColors: Record<QuoteStatus, string> = {
  Borrador: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 border-gray-300",
  Enviada: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300",
  Aceptada: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300",
  Rechazada: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300",
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

export function QuotesTable() {
  const { firestore } = useFirebase();
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [leadCache, setLeadCache] = useState<Record<string, Lead>>({});
  const [userCache, setUserCache] = useState<Record<string, User>>({});

  const quotesCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'quotes'));
  }, [firestore]);

  const { data: quotes, isLoading } = useCollection<Quote>(quotesCollectionRef);

  useEffect(() => {
    const fetchLeadAndUserData = async () => {
      if (!quotes || !firestore) return;

      const leadIds = new Set(quotes.map(q => q.leadId));
      const newLeadCache: Record<string, Lead> = { ...leadCache };
      const newUserCache: Record<string, User> = { ...userCache };
      let assignedToIds = new Set<string>();

      for (const leadId of Array.from(leadIds)) {
        if (newLeadCache[leadId]) continue;

        try {
          const leadDocRef = doc(firestore, 'leads', leadId);
          const leadDoc = await getDoc(leadDocRef);
          if (leadDoc.exists()) {
            const leadData = { id: leadDoc.id, ...leadDoc.data() } as Lead;
            newLeadCache[leadId] = leadData;

            if (leadData.assignedToId) {
              assignedToIds.add(leadData.assignedToId);
            }
          }
        } catch (error) {
          const contextualError = new FirestorePermissionError({
            operation: 'get',
            path: `leads/${leadId}`,
          });
          errorEmitter.emit('permission-error', contextualError);
          console.error(`Failed to fetch lead ${leadId}`, error);
        }
      }

      for (const userId of Array.from(assignedToIds)) {
        if (newUserCache[userId]) continue;
        try {
          const userDocRef = doc(firestore, 'users', userId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            newUserCache[userId] = { id: userDoc.id, ...userDoc.data() } as User;
          }
        } catch (error) {
          console.error(`Failed to fetch user ${userId}`, error);
        }
      }

      setLeadCache(newLeadCache);
      setUserCache(newUserCache);
    };

    fetchLeadAndUserData();
  }, [quotes, firestore]);

  const handleDownloadPdf = async (quote: Quote) => {
    const lead = leadCache[quote.leadId];
    const quoteUser = lead ? userCache[lead.assignedToId] : undefined;
    if (!lead) return;

    setIsGenerating(quote.id);
    try {
      const blob = await generatePdf(quote, lead, quoteUser);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cotizacion-${quote.quoteNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(null);
    }
  };


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
              <TableHead className="hidden sm:table-cell">Solución</TableHead>
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
            {isLoading && Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
            {!isLoading && quotes?.map((quote) => {
              const lead = leadCache[quote.leadId];

              if (!lead) {
                // Show a skeleton or loading state while lead data is being fetched
                return (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                    <TableCell colSpan={6}><Skeleton className="h-4 w-full" /></TableCell>
                  </TableRow>
                )
              }

              return (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                  <TableCell>
                    <div className="font-medium">{lead?.contactName}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {lead?.companyName}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{quote.solution}</TableCell>
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
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/quotes/${quote.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownloadPdf(quote)}
                          disabled={isGenerating === quote.id}
                        >
                          {isGenerating === quote.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generando...
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Descargar PDF
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Enviar por Correo</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
            {!isLoading && (!quotes || quotes.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No has creado ninguna cotización.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
