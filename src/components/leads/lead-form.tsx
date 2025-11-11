'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { users } from '@/lib/data';
import type { LeadStatus } from '@/lib/types';

const leadStatuses: LeadStatus[] = ['Nuevo', 'Contactado', 'Calificado', 'Propuesta', 'Ganado', 'Perdido'];
const leadSources = ['Sitio Web', 'Referido', 'Llamada en Frío', 'Publicidad', 'Evento', 'Otro'];

const formSchema = z.object({
  contactName: z.string().min(2, 'El nombre del contacto es requerido.'),
  companyName: z.string().min(2, 'El nombre de la empresa es requerido.'),
  contactEmail: z.string().email('Por favor, ingresa un correo electrónico válido.'),
  contactPhone: z.string().min(5, 'Por favor, ingresa un número de teléfono válido.'),
  source: z.string({ required_error: 'Por favor, selecciona una fuente.' }),
  status: z.enum(leadStatuses, { required_error: 'Por favor, selecciona un estado.' }),
  assignedToId: z.string({ required_error: 'Por favor, asigna el prospecto a un usuario.' }),
});

export function LeadForm() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactName: '',
      companyName: '',
      contactEmail: '',
      contactPhone: '',
      status: 'Nuevo',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Mock saving the data
    console.log(values);

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
              name="assignedToId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asignado a</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un miembro del equipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
            </Button>
            <Button type="submit">Guardar Prospecto</Button>
        </div>
      </form>
    </Form>
  );
}
