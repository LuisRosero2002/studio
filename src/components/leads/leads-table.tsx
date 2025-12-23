'use client';
import Link from 'next/link';
import { MoreHorizontal } from "lucide-react"
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
import { type Lead, type LeadStatus, type User, WithId } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import { useEffect, useState } from 'react';

const statusColors: Record<LeadStatus, string> = {
  Nuevo: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300",
  Contactado: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300 border-cyan-300",
  Calificado: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300",
  Propuesta: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-300",
  Ganado: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300",
  Perdido: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300",
}

type EnrichedLead = WithId<Lead> & { assignedUser?: WithId<User> }

export function LeadsTable() {
  const { firestore, user } = useFirebase();
  const [enrichedLeads, setEnrichedLeads] = useState<EnrichedLead[]>([]);
  const [isEnriching, setIsEnriching] = useState(true);

  const leadsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'leads'));
  }, [firestore]);

  const { data: leads, isLoading } = useCollection<Lead>(leadsQuery);

  useEffect(() => {
    const enrichLeads = async () => {
      if (!leads || !firestore) {
        if (!isLoading) {
          setEnrichedLeads([]);
          setIsEnriching(false);
        }
        return;
      };

      setIsEnriching(true);
      const userCache: Record<string, User> = {};

      const enriched = await Promise.all(
        leads.map(async (lead) => {
          if (lead.assignedToId) {
            if (userCache[lead.assignedToId]) {
              return { ...lead, assignedUser: userCache[lead.assignedToId] };
            }
            const userDocRef = doc(firestore, 'users', lead.assignedToId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = { id: userDoc.id, ...userDoc.data() } as User;
              userCache[lead.assignedToId] = userData;
              return { ...lead, assignedUser: userData };
            }
          }
          return lead;
        })
      );
      setEnrichedLeads(enriched);
      setIsEnriching(false);
    };

    enrichLeads();
  }, [leads, firestore, isLoading]);

  const currentlyLoading = isLoading || isEnriching;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos los Prospectos</CardTitle>
        <CardDescription>Una lista de todos los prospectos en tu embudo de ventas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asignado a</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">
                Probabilidad
              </TableHead>
              <TableHead className="hidden md:table-cell">
                Creado en
              </TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentlyLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24 mt-1" />
                </TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
            {!currentlyLoading && enrichedLeads?.map((lead) => {
              const { assignedUser } = lead;
              return (
                <TableRow key={lead.id}>
                   <TableCell className="font-medium">
                     {assignedUser?.name ?? 'Sin asignar'}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{lead.contactName}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {lead.companyName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border", statusColors[lead.status])}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {Math.round(lead.purchaseProbability * 100)}%
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(lead.createdAt), 'd MMM, yyyy', { locale: es })}
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
                            <Link href={`/dashboard/leads/${lead.id}`}>Ver Detalles</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
         {!currentlyLoading && (!enrichedLeads || enrichedLeads.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
                No tienes prospectos. ¡Añade uno para empezar!
            </div>
        )}
      </CardContent>
    </Card>
  )
}
