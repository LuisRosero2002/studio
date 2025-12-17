'use client';

import { useParams, notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import React, { useState, useEffect, useRef } from 'react';
import * as Comlink from 'comlink';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

import type { Quote, QuoteStatus, Lead, User } from "@/lib/types";
import { useFirebase, useDoc, useMemoFirebase } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors: Record<QuoteStatus, string> = {
  Borrador: "bg-gray-100 text-gray-800",
  Enviada: "bg-blue-100 text-blue-800",
  Aceptada: "bg-green-100 text-green-800",
  Rechazada: "bg-red-100 text-red-800",
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
};

// Define the worker API type
interface PdfWorkerApi {
  generatePdf: (quote: any, lead: any, user?: any) => Promise<Blob>;
}

export default function QuoteDetailPage() {
  const params = useParams();
  const quoteId = params.id as string;
  const { firestore, user: authUser } = useFirebase();
  const router = useRouter();

  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);

  // Comlink worker setup
  const workerRef = useRef<Worker>();
  const workerApiRef = useRef<Comlink.Remote<PdfWorkerApi>>();

  const quoteDocRef = useMemoFirebase(() => {
    if (!authUser || !quoteId) return null;
    return doc(firestore, 'users', authUser.uid, 'quotes', quoteId);
  }, [firestore, authUser, quoteId]);
  
  const { data: quote, isLoading: isQuoteLoading } = useDoc<Quote>(quoteDocRef);

  const [lead, setLead] = useState<Lead | null>(null);
  const [assignedUser, setAssignedUser] = useState<User | null>(null);
  const [isLeadLoading, setIsLeadLoading] = useState(true);

   useEffect(() => {
    workerRef.current = new Worker(new URL('../../../../workers/pdf.worker.ts', import.meta.url));
    workerApiRef.current = Comlink.wrap<PdfWorkerApi>(workerRef.current);
    
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    const fetchLeadAndUser = async () => {
        if (!quote || !firestore || !authUser) return;
        setIsLeadLoading(true);

        try {
            const leadDocRef = doc(firestore, 'users', authUser.uid, 'leads', quote.leadId);
            const leadDoc = await getDoc(leadDocRef);
            
            if (leadDoc.exists()) {
                const leadData = { id: leadDoc.id, ...leadDoc.data() } as Lead;
                setLead(leadData);

                if (leadData.assignedToId) {
                    const userDocRef = doc(firestore, 'users', leadData.assignedToId);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        setAssignedUser({ id: userDoc.id, ...userDoc.data() } as User);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching lead/user data:', error);
            const contextualError = new FirestorePermissionError({
                operation: 'get',
                path: `users/${authUser.uid}/leads/${quote.leadId} or users/${lead?.assignedToId}`,
            });
            errorEmitter.emit('permission-error', contextualError);
        } finally {
            setIsLeadLoading(false);
        }
    };
    fetchLeadAndUser();
  }, [quote, firestore, authUser]);

   useEffect(() => {
    const generateInitialPdf = async () => {
        if (!quote || !lead || !workerApiRef.current) return;
        setIsLoadingPdf(true);
        try {
            const blob = await workerApiRef.current.generatePdf(quote, lead, assignedUser);
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch(e) {
            console.error("Error generating initial PDF", e);
        } finally {
            setIsLoadingPdf(false);
        }
    };
    
    if (quote && lead) {
      generateInitialPdf();
    }
  }, [quote, lead, assignedUser]);

  const handleDownloadPdf = async () => {
    if (!quote || !lead || !workerApiRef.current) return;

    setIsGenerating(true);
    try {
        const blob = await workerApiRef.current.generatePdf(quote, lead, assignedUser);
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
        setIsGenerating(false);
    }
  };
  
  const isLoading = isQuoteLoading || isLeadLoading;
  
  if (!isLoading && !quote) {
    return notFound();
  }

  if (isLoading || !lead) {
      return <div className="p-6 space-y-6">
          <Skeleton className="h-9 w-48" />
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
                <Skeleton className="h-40" />
                <Skeleton className="h-48" />
                <Skeleton className="h-32" />
            </div>
            <div className="lg:col-span-3">
                <Skeleton className="h-[80vh]" />
            </div>
          </div>
      </div>
  }


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
            Cotización #{quote!.quoteNumber}
          </h1>
        </div>
        <div className="flex gap-2">
            <Button>
                <Mail className="mr-2 h-4 w-4" />
                Enviar por Correo
            </Button>
            <Button variant="secondary" onClick={handleDownloadPdf} disabled={isGenerating}>
              {isGenerating ? (
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
            </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Detalles</CardTitle>
                    <Badge className={statusColors[quote!.status]}>{quote!.status}</Badge>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                        <p className="text-muted-foreground">Fecha de Emisión:</p>
                        <p className="font-medium text-right">{format(new Date(quote!.issueDate), 'd MMM, yyyy', { locale: es })}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <p className="text-muted-foreground">Válida Hasta:</p>
                        <p className="font-medium text-right">{format(new Date(quote!.validUntil), 'd MMM, yyyy', { locale: es })}</p>
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
                        <p className="font-medium text-right">{lead!.companyName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <p className="text-muted-foreground">Contacto:</p>
                        <p className="font-medium text-right">{lead!.contactName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <p className="text-muted-foreground">Correo:</p>
                        <p className="font-medium text-right">{lead!.contactEmail}</p>
                    </div>
                     <div className="grid grid-cols-2 gap-2">
                        <p className="text-muted-foreground">Teléfono:</p>
                        <p className="font-medium text-right">{lead!.contactPhone}</p>
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
                        <span>{formatCurrency(quote!.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">IVA (16%)</span>
                        <span>{formatCurrency(quote!.tax)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-base">
                        <span>Total</span>
                        <span>{formatCurrency(quote!.total)}</span>
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
                 {isLoadingPdf ? (
                    <div className="flex h-full w-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : pdfUrl ? (
                    <iframe src={pdfUrl} width="100%" height="95%" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-destructive">
                        Error al cargar el PDF.
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
