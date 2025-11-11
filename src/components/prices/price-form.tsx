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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { PriceItemType, PriceItemUnit, PriceItemStatus } from '@/lib/types';

const itemTypes: PriceItemType[] = ['Hardware', 'Servicio', 'Instalación'];
const itemUnits: PriceItemUnit[] = ['Por unidad', 'Por hora', 'Por instalación', 'Mensual', 'Anual'];
const itemStatuses: PriceItemStatus[] = ['Activo', 'Inactivo'];

const formSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  type: z.enum(itemTypes, { required_error: 'Por favor, selecciona un tipo.' }),
  unit: z.enum(itemUnits, { required_error: 'Por favor, selecciona una unidad.' }),
  basePrice: z.coerce.number().min(0, 'El precio base debe ser un número positivo.'),
  status: z.enum(itemStatuses, { required_error: 'Por favor, selecciona un estado.' }),
});

export function PriceForm() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: 0,
      status: 'Activo',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Mock saving the data
    console.log(values);

    toast({
      title: 'Ítem de Precio Guardado',
      description: `El ítem "${values.name}" ha sido creado exitosamente.`,
    });

    router.push('/dashboard/precios');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nombre del Ítem</FormLabel>
                        <FormControl>
                            <Input placeholder="p. ej. Sensor de Humedad" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Describe el ítem, sus características y alcance."
                            className="resize-none"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="space-y-6">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tipo de Ítem</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {itemTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                {type}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Unidad de Medida</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una unidad" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {itemUnits.map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                {unit}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Precio Base (MXN)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
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
                            {itemStatuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                {status}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>

        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
            </Button>
            <Button type="submit">Guardar Ítem</Button>
        </div>
      </form>
    </Form>
  );
}
