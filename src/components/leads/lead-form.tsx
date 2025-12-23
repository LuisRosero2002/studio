'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { LeadStatus, PriceItem, User } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, query } from 'firebase/firestore';
import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { formatISO } from 'date-fns';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

const leadStatuses: LeadStatus[] = ['Nuevo', 'Contactado', 'Calificado', 'Propuesta', 'Ganado', 'Perdido'];
const leadSources = ['Sitio Web', 'Referido', 'Llamada en Frío', 'Publicidad', 'Evento', 'Otro'];

const formSchema = z.object({
  contactName: z.string().min(2, 'El nombre del contacto es requerido.'),
  companyName: z.string().min(2, 'El nombre de la empresa es requerido.'),
  contactEmail: z.string().email('Por favor, ingresa un correo electrónico válido.'),
  contactPhone: z.string().min(5, 'Por favor, ingresa un número de teléfono válido.'),
  source: z.string({ required_error: 'Por favor, selecciona una fuente.' }),
  status: z.enum(leadStatuses, { required_error: 'Por favor, selecciona un estado.' }),
  solutionInterest: z.string().optional(),
  purchaseProbability: z.coerce.number().min(0).max(100),
  assignedToId: z.string({ required_error: 'Por favor, asigna un responsable.' }),
});

export function LeadForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);

  const usersCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, [firestore]);
  const { data: users, isLoading: isUsersLoading } = useCollection<User>(usersCollectionRef);

  const priceItemsCollectionRef = useMemoFirebase(() => collection(firestore, 'priceItems'), [firestore]);
  const { data: priceItems, isLoading: arePriceItemsLoading } = useCollection<PriceItem>(priceItemsCollectionRef);

  const uniqueSolutions = useMemo(() => {
    if (!priceItems) return [];
    const solutionSet = new Set(priceItems.map(item => item.solution));
    return Array.from(solutionSet);
  }, [priceItems]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactName: '',
      companyName: '',
      contactEmail: '',
      contactPhone: '',
      status: 'Nuevo',
      purchaseProbability: 10,
      solutionInterest: '',
    },
  });

  useEffect(() => {
    if (user && !form.getValues('assignedToId')) {
        form.setValue('assignedToId', user.uid);
    }
  }, [user, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para crear un prospecto.' });
      return;
    }
    setIsLoading(true);

    const newLead = {
      ...values,
      purchaseProbability: values.purchaseProbability / 100, // Convert to 0-1 range
      createdAt: formatISO(new Date()),
      lastContacted: formatISO(new Date()),
      ownerId: user.uid,
    }

    const leadsCollectionRef = collection(firestore, 'leads');
    addDoc(leadsCollectionRef, newLead).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: leadsCollectionRef.path,
        operation: 'create',
        requestResourceData: newLead
      }));
    });

    toast({
      title: 'Prospecto Guardado',
      description: `El prospecto "${values.contactName}" ha sido creado exitosamente.`,
    });

    router.push('/dashboard/leads');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Contacto</FormLabel>
                  <FormControl>
                    <Input placeholder="p. ej. Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="p. ej. Agroindustria S.A." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="p. ej. juan.perez@agro.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="p. ej. 55-1234-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuente del Prospecto</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una fuente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leadSources.map(source => (
                        <SelectItem key={source} value={source}>{source}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leadStatuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="solutionInterest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solución de Interés</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger disabled={arePriceItemsLoading}>
                        <SelectValue placeholder="Selecciona una solución" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {uniqueSolutions.map(solution => (
                        <SelectItem key={solution} value={solution}>{solution}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchaseProbability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Probabilidad de Compra (%)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="assignedToId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Asignado a</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isUsersLoading}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un usuario" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {!isUsersLoading && users?.map(userItem => (
                            <SelectItem key={userItem.id} value={userItem.id}>{userItem.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Prospecto
            </Button>
        </div>
      </form>
    </Form>
  );
}
