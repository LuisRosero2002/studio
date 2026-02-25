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
import type { PriceItem, PriceItemType, PriceItemUnit, PriceItemStatus } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { formatISO } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const itemTypes: PriceItemType[] = ['Hardware', 'Servicio', 'Instalación'];
const itemUnits: PriceItemUnit[] = ['Por unidad', 'Por hora', 'Por instalación', 'Mensual', 'Anual'];
const itemStatuses: PriceItemStatus[] = ['Activo', 'Inactivo'];

const formSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  solutionSelection: z.enum(['existing', 'new']),
  solution: z.string().optional(),
  newSolution: z.string().optional(),
  type: z.enum(itemTypes, { required_error: 'Por favor, selecciona un tipo.' }),
  unit: z.enum(itemUnits, { required_error: 'Por favor, selecciona una unidad.' }),
  basePrice: z.coerce.number().min(0, 'El precio base debe ser un número positivo.'),
  currency: z.enum(['COP', 'USD'], { required_error: 'Selecciona una moneda.' }),
  status: z.enum(itemStatuses, { required_error: 'Por favor, selecciona un estado.' }),
}).refine(data => {
    if (data.solutionSelection === 'existing') return !!data.solution;
    if (data.solutionSelection === 'new') return !!data.newSolution && data.newSolution.length > 2;
    return false;
}, {
    message: "Por favor, selecciona una solución existente o escribe el nombre de una nueva (mín. 3 caracteres).",
    path: ["solution"],
});

export function PriceForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);

  const priceItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'priceItems');
  }, [firestore]);

  const { data: priceItems, isLoading: arePriceItemsLoading } = useCollection<PriceItem>(priceItemsQuery);

  const uniqueSolutions = useMemo(() => {
    if (!priceItems) return [];
    const solutionSet = new Set(priceItems.map(item => item.solution));
    return Array.from(solutionSet).filter(Boolean);
  }, [priceItems]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: 0,
      currency: 'COP',
      status: 'Activo',
      solutionSelection: 'existing',
      solution: '',
      newSolution: '',
      type: 'Hardware',
      unit: 'Por unidad'
    },
  });

  const solutionSelection = form.watch('solutionSelection');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para añadir un precio.' });
      return;
    }
    setIsLoading(true);

    const finalSolution = values.solutionSelection === 'new' ? values.newSolution : values.solution;

    const newPriceItem = {
      name: values.name,
      description: values.description,
      solution: finalSolution,
      type: values.type,
      unit: values.unit,
      basePrice: values.basePrice,
      currency: values.currency,
      status: values.status,
      lastUpdatedAt: formatISO(new Date()),
      ownerId: user.uid,
    };

    const priceItemsCollectionRef = collection(firestore, 'priceItems');
    addDoc(priceItemsCollectionRef, newPriceItem).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: priceItemsCollectionRef.path,
        operation: 'create',
        requestResourceData: newPriceItem,
      }));
    });

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
                <FormField
                    control={form.control}
                    name="solutionSelection"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Solución / Proyecto</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="existing" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                Usar solución existente
                                </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="new" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                Crear nueva solución
                                </FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {solutionSelection === 'existing' && (
                    <FormField
                        control={form.control}
                        name="solution"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Solución Existente</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={arePriceItemsLoading}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una solución" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {uniqueSolutions.map((solution) => (
                                    <SelectItem key={solution} value={solution}>
                                    {solution}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                {solutionSelection === 'new' && (
                    <FormField
                        control={form.control}
                        name="newSolution"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nombre de la Nueva Solución</FormLabel>
                            <FormControl>
                                <Input placeholder="p. ej. Monitoreo de Cultivos V2" {...field} />
                            </FormControl>
                            <FormDescription>
                                Este nombre se usará para crear una nueva categoría de solución.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
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
                <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                        <FormField
                            control={form.control}
                            name="basePrice"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Precio Base</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div>
                        <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Moneda</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="COP" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="COP">COP</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
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
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Ítem
            </Button>
        </div>
      </form>
    </Form>
  );
}