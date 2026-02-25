'use client';

import { useParams, notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download, Mail, Loader2, HardDrive, Wrench, Server, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import React, { useState, useEffect } from 'react';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { doc, getDoc } from "firebase/firestore";

import type { Quote, QuoteStatus, Lead, User, QuoteItem } from "@/lib/types";
import { useFirebase, useDoc, useMemoFirebase } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { generatePdf } from "@/lib/generate-pdf";

const statusColors: Record<QuoteStatus, string> = {
  Borrador: "bg-gray-100 text-gray-800",
  Enviada: "bg-blue-100 text-blue-800",
  Aceptada: "bg-green-100 text-green-800",
  Rechazada: "bg-red-100 text-red-800",
};

const formatCurrency = (amount: number, currency: string = 'COP') => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(amount);
};

const ItemsTable = ({ title, items, icon: Icon }: { title: string, items: QuoteItem[], icon: React.ElementType }) => {
  if (!items || items.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg"><Icon className="w-5 h-5" /> {title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-center">Cant.</TableHead>
              <TableHead className="text-right">Precio Unit.</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.description}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.unitPrice, item.currency)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.quantity * item.unitPrice, item.currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default function QuoteDetailPage() {
  const params = useParams();
  const quoteId = params.id as string;
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const [assignedUser, setAssignedUser] = useState<User | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const quoteDocRef = useMemoFirebase(() => {
    if (!quoteId || !firestore) return null;
    return doc(firestore, 'quotes', quoteId);
  }, [firestore, quoteId]);

  const { data: quote, isLoading: isQuoteLoading } = useDoc<Quote>(quoteDocRef);

  useEffect(() => {
    const fetchLeadAndUser = async () => {
      if (!quote || !firestore) return;
      setIsDataLoading(true);

      try {
        const leadDocRef = doc(firestore, 'leads', quote.leadId);
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
        console.error(error);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchLeadAndUser();
  }, [quote, firestore]);

  const handleDownload = async () => {
    if (!quote || !lead) return;
    setIsGenerating(true);
    try {
      const blob = await generatePdf(quote, lead, assignedUser ?? undefined);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cotizacion-${quote.quoteNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast({ title: "PDF Generado" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo generar el PDF." });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isQuoteLoading || isDataLoading) {
    return <div className="p-6 space-y-6"><Skeleton className="h-9 w-48" /><Skeleton className="h-[400px]" /></div>
  }

  if (!quote) return notFound();

  return (
    <div className="grid gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-4">
            <Link href="/dashboard/quotes"><ChevronLeft className="mr-2 h-4 w-4" /> Volver</Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Cotización #{quote.quoteNumber}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/quotes/${quote.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Editar</Link>
          </Button>
          <Button variant="secondary" onClick={handleDownload} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Descargar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 max-w-5xl mx-auto w-full">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Detalles</CardTitle>
              <Badge className={statusColors[quote.status]}>{quote.status}</Badge>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div className="flex justify-between"><span>Soluciones:</span><span className="font-medium text-right">{quote.solutions?.join(', ') || 'N/A'}</span></div>
              <div className="flex justify-between"><span>Emisión:</span><span className="font-medium">{format(new Date(quote.issueDate), 'd MMM, yyyy', { locale: es })}</span></div>
              <div className="flex justify-between"><span>Vence:</span><span className="font-medium">{quote.validUntil ? format(new Date(quote.validUntil), 'd MMM, yyyy', { locale: es }) : 'N/A'}</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div className="flex justify-between"><span>Compañía:</span><span className="font-medium">{lead?.companyName}</span></div>
              <div className="flex justify-between"><span>Contacto:</span><span className="font-medium">{lead?.contactName}</span></div>
              <div className="flex justify-between"><span>Correo:</span><span className="font-medium">{lead?.contactEmail}</span></div>
            </CardContent>
          </Card>
        </div>

        <ItemsTable title="Equipos (Hardware)" items={quote.hardwareItems} icon={HardDrive} />
        <ItemsTable title="Costos de Implementación" items={quote.installationItems} icon={Wrench} />
        <ItemsTable title="Servicios Adicionales" items={quote.serviceItems} icon={Server} />

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader><CardTitle>Descripción y Notas</CardTitle></CardHeader>
            <CardContent><p className="text-sm whitespace-pre-wrap">{quote.notes || 'Sin notas adicionales.'}</p></CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader><CardTitle>Resumen Financiero (COP)</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${quote.subtotal.toLocaleString('es-CO')}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>IVA (19%)</span><span>${quote.tax.toLocaleString('es-CO')}</span></div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${quote.total.toLocaleString('es-CO')}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
