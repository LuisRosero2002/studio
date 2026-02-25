'use client';

import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { CalendarIcon, PlusCircle, Trash2, ChevronsUpDown } from 'lucide-react';
import { format, formatISO, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useMemo, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { Lead, PriceItem, Quote, QuoteItem } from '@/lib/types';
import { collection, doc, addDoc, updateDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const quoteItemSchema = z.object({
  priceItemId: z.string().min(1, 'Debes seleccionar un ítem.'),
  description: z.string().min(1, 'La descripción es requerida'),
  quantity: z.coerce.number().min(1, 'La cantidad debe ser al menos 1'),
  unitPrice: z.coerce.number().min(0, 'El precio unitario debe ser positivo'),
  currency: z.enum(['COP', 'USD']),
  total: z.coerce.number().optional()
});

const formSchema = z.object({
  leadId: z.string({ required_error: 'Por favor, selecciona un prospecto.' }),
  solutions: z.array(z.string()).default([]),
  issueDate: z.date({ required_error: 'La fecha de emisión es requerida.' }),
  validUntil: z.date({ required_error: 'La fecha de vencimiento es requerida.' }),
  exchangeRate: z.coerce.number().optional().default(4000),
  notes: z.string().optional(),
  hardwareItems: z.array(quoteItemSchema).default([]),
  installationItems: z.array(quoteItemSchema).default([]),
  serviceItems: z.array(quoteItemSchema).default([]),
}).refine(
    (data) => (data.hardwareItems?.length || 0) + (data.installationItems?.length || 0) + (data.serviceItems?.length || 0) > 0,
    {
      message: 'Por favor, añade al menos un ítem a la cotización.',
      path: ['hardwareItems'],
    }
);

const SectionedItemsTable = ({
  fieldArray,
  watchName,
  control,
  form,
  title,
  availableItems,
  exchangeRate
}: {
  fieldArray: any;
  watchName: 'hardwareItems' | 'installationItems' | 'serviceItems';
  control: any;
  form: any;
  title: string;
  availableItems: PriceItem[];
  exchangeRate: number;
}) => {
  const { fields, append, remove } = fieldArray;
  const watchedItems = useWatch({ control, name: watchName });

  const handleItemSelect = (index: number, priceItemId: string) => {
    const selectedItem = availableItems.find(item => item.id === priceItemId);
    if (selectedItem) {
      form.setValue(`${watchName}.${index}.description`, selectedItem.name);
      form.setValue(`${watchName}.${index}.unitPrice`, selectedItem.basePrice);
      form.setValue(`${watchName}.${index}.currency`, selectedItem.currency || 'COP');
      form.setValue(`${watchName}.${index}.priceItemId`, selectedItem.id);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripción</TableHead>
              <TableHead className="w-[80px]">Cant.</TableHead>
              <TableHead className="w-[120px]">Precio Unit.</TableHead>
              <TableHead className="w-[100px]">Moneda</TableHead>
              <TableHead className="w-[120px] text-right">Total (COP)</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field: any, index: number) => {
              const item = watchedItems?.[index];
              const itemTotal = (item?.quantity || 0) * (item?.unitPrice || 0) * (item?.currency === 'USD' ? (exchangeRate || 1) : 1);
              
              return (
                <TableRow key={field.id}>
                  <TableCell>
                    <FormField
                      control={control}
                      name={`${watchName}.${index}.priceItemId`}
                      render={({ field }) => (
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          handleItemSelect(index, value);
                        }} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un ítem" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableItems.map(item => (
                              <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField control={control} name={`${watchName}.${index}.quantity`} render={({ field }) => <Input type="number" {...field} className="px-2" />} />
                  </TableCell>
                  <TableCell>
                    <FormField control={control} name={`${watchName}.${index}.unitPrice`} render={({ field }) => <Input type="number" {...field} />} />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={control}
                      name={`${watchName}.${index}.currency`}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
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
                      )}
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${itemTotal.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
             {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground pt-8">
                  No hay ítems en esta sección.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-start border-t p-6">
        <Button type="button" variant="outline" size="sm" onClick={() => append({ priceItemId: '', description: '', quantity: 1, unitPrice: 0, currency: 'COP' })}>
          <PlusCircle className="h-4 w-4 mr-2"/> Añadir Ítem
        </Button>
      </CardFooter>
    </Card>
  );
};

interface QuoteFormProps {
  initialData?: Quote;
}

export function QuoteForm({ initialData }: QuoteFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);

  const leadsCollectionRef = useMemoFirebase(() => collection(firestore, 'leads'), [firestore]);
  const { data: leads } = useCollection<Lead>(leadsCollectionRef);

  const priceItemsCollectionRef = useMemoFirebase(() => collection(firestore, 'priceItems'), [firestore]);
  const { data: priceItems } = useCollection<PriceItem>(priceItemsCollectionRef);

  const parseSafeDate = (dateStr: string | undefined) => {
    if (!dateStr) return undefined;
    const date = parseISO(dateStr);
    return isValid(date) ? date : undefined;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leadId: initialData?.leadId || '',
      solutions: initialData?.solutions || [],
      issueDate: parseSafeDate(initialData?.issueDate) || new Date(),
      validUntil: parseSafeDate(initialData?.validUntil),
      exchangeRate: initialData?.exchangeRate || 4000,
      notes: initialData?.notes || '',
      hardwareItems: initialData?.hardwareItems || [],
      installationItems: initialData?.installationItems || [],
      serviceItems: initialData?.serviceItems || [],
    },
  });
  
  const selectedSolutions = form.watch('solutions');
  const exchangeRate = form.watch('exchangeRate') || 4000;

  const filteredPriceItems = useMemo(() => {
    if (!priceItems) return { hardware: [], installation: [], service: [] };
    
    const itemsToFilter = selectedSolutions && selectedSolutions.length > 0
      ? priceItems.filter(item => selectedSolutions.includes(item.solution))
      : priceItems;

    return {
      hardware: itemsToFilter.filter(item => item.type === 'Hardware' && item.status === 'Activo'),
      installation: itemsToFilter.filter(item => item.type === 'Instalación' && item.status === 'Activo'),
      service: itemsToFilter.filter(item => item.type === 'Servicio' && item.status === 'Activo')
    };
  }, [priceItems, selectedSolutions]);

  const uniqueSolutions = useMemo(() => {
    if (!priceItems) return [];
    const solutionSet = new Set(priceItems.map(item => item.solution));
    return Array.from(solutionSet).filter(Boolean).sort();
  }, [priceItems]);

  const hardwareFieldArray = useFieldArray({ control: form.control, name: 'hardwareItems' });
  const installationFieldArray = useFieldArray({ control: form.control, name: 'installationItems' });
  const serviceFieldArray = useFieldArray({ control: form.control, name: 'serviceItems' });
  
  const watchedHardware = form.watch('hardwareItems');
  const watchedInstallation = form.watch('installationItems');
  const watchedServices = form.watch('serviceItems');
  
  const calculateCOP = (items: QuoteItem[] | undefined) => 
    items ? items.reduce((acc, item) => acc + ((item.quantity || 0) * (item.unitPrice || 0) * (item.currency === 'USD' ? (exchangeRate || 1) : 1)), 0) : 0;

  const subtotal = calculateCOP(watchedHardware) + calculateCOP(watchedInstallation) + calculateCOP(watchedServices);
  const taxAmount = subtotal * 0.19;
  const total = subtotal + taxAmount;

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) return;
    setIsLoading(true);

    const mapItems = (items: any[]) => items?.map(item => ({
        ...item,
        total: (item.quantity || 0) * (item.unitPrice || 0)
    })) || [];

    const quoteData = {
        ...values,
        issueDate: formatISO(values.issueDate),
        validUntil: values.validUntil ? formatISO(values.validUntil) : '',
        hardwareItems: mapItems(values.hardwareItems),
        installationItems: mapItems(values.installationItems),
        serviceItems: mapItems(values.serviceItems),
        subtotal,
        tax: taxAmount,
        total,
        status: initialData?.status || 'Borrador',
        ownerId: user.uid,
    };

    if (initialData) {
      const quoteRef = doc(firestore, 'quotes', initialData.id);
      updateDoc(quoteRef, quoteData)
        .then(() => {
            toast({ title: "Cotización Actualizada", description: "Los cambios han sido guardados correctamente." });
            router.push('/dashboard/quotes');
        })
        .catch((error: any) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: quoteRef.path,
                operation: 'update',
                requestResourceData: quoteData,
            }));
            setIsLoading(false);
        });
    } else {
      const quoteNumber = `Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
      const quotesCollectionRef = collection(firestore, 'quotes');
      addDoc(quotesCollectionRef, { ...quoteData, quoteNumber })
        .then(() => {
            toast({ title: "Cotización Creada", description: "La cotización ha sido guardada exitosamente." });
            router.push('/dashboard/quotes');
        })
        .catch((error: any) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: quotesCollectionRef.path,
                operation: 'create',
                requestResourceData: { ...quoteData, quoteNumber },
            }));
            setIsLoading(false);
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Cotización</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <FormField
                    control={form.control}
                    name="leadId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Cliente/Prospecto</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {leads?.map(lead => (
                                <SelectItem key={lead.id} value={lead.id}>{lead.companyName}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="solutions"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Soluciones</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                    "w-full justify-between font-normal",
                                    !field.value?.length && "text-muted-foreground"
                                )}
                                >
                                {field.value?.length > 0
                                    ? `${field.value.length} seleccionada(s)`
                                    : "Seleccionar soluciones"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                            <div className="p-2 space-y-2 max-h-[300px] overflow-auto">
                                {uniqueSolutions.map((solution) => (
                                <div key={solution} className="flex items-center space-x-2">
                                    <Checkbox
                                    id={`solution-${solution}`}
                                    checked={field.value?.includes(solution)}
                                    onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        const next = checked
                                        ? [...current, solution]
                                        : current.filter((v) => v !== solution);
                                        field.onChange(next);
                                    }}
                                    />
                                    <label
                                    htmlFor={`solution-${solution}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                    {solution}
                                    </label>
                                </div>
                                ))}
                                {uniqueSolutions.length === 0 && (
                                    <p className="text-xs text-muted-foreground p-2 text-center">No hay soluciones disponibles.</p>
                                )}
                            </div>
                            </PopoverContent>
                        </Popover>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Fecha Emisión</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "d MMM, yyyy", { locale: es }) : <span>Elige</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={es} />
                            </PopoverContent>
                        </Popover>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="validUntil"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Válida Hasta</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "d MMM, yyyy", { locale: es }) : <span>Elige</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={es} />
                            </PopoverContent>
                        </Popover>
                        </FormItem>
                    )}
                />
            </CardContent>
          </Card>
          
          <SectionedItemsTable 
            fieldArray={hardwareFieldArray}
            watchName="hardwareItems" 
            control={form.control} 
            form={form}
            title="Equipos (Hardware)"
            availableItems={filteredPriceItems.hardware}
            exchangeRate={exchangeRate}
          />

          <SectionedItemsTable 
            fieldArray={installationFieldArray}
            watchName="installationItems"
            control={form.control}
            form={form}
            title="Costos de Implementación"
            availableItems={filteredPriceItems.installation}
            exchangeRate={exchangeRate}
          />
          
          <SectionedItemsTable 
            fieldArray={serviceFieldArray}
            watchName="serviceItems"
            control={form.control}
            form={form}
            title="Servicios Adicionales"
            availableItems={filteredPriceItems.service}
            exchangeRate={exchangeRate}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Descripción y Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Términos comerciales, tiempos de entrega, etc." className="min-h-[120px]" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                  <CardTitle>Resumen Financiero (COP)</CardTitle>
              </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">${subtotal.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IVA (19%):</span>
                    <span className="font-medium">${taxAmount.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-4 text-primary">
                    <span>Total:</span>
                    <span>${total.toLocaleString('es-CO')}</span>
                  </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Actualizar Cotización' : 'Crear Cotización'}
            </Button>
          </div>
      </form>
    </Form>
  );
}
