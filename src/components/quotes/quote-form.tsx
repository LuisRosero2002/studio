'use client';

import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { format, formatISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { DiscountSuggester } from './discount-suggester';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { Lead, PriceItem, PriceItemType } from '@/lib/types';
import { collection, addDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const quoteItemSchema = z.object({
  priceItemId: z.string().min(1, 'Debes seleccionar un ítem.'),
  description: z.string().min(1, 'La descripción es requerida'),
  quantity: z.coerce.number().min(1, 'La cantidad debe ser al menos 1'),
  unitPrice: z.coerce.number().min(0, 'El precio unitario debe ser positivo'),
  total: z.coerce.number()
});

type QuoteItem = z.infer<typeof quoteItemSchema>;

const formSchema = z.object({
  leadId: z.string({ required_error: 'Por favor, selecciona un prospecto.' }),
  solution: z.string({ required_error: 'Por favor, selecciona una solución.' }),
  issueDate: z.date({ required_error: 'La fecha de emisión es requerida.' }),
  validUntil: z.date({ required_error: 'La fecha de vencimiento es requerida.' }),
  hardwareItems: z.array(quoteItemSchema).optional(),
  installationItems: z.array(quoteItemSchema).optional(),
  serviceItems: z.array(quoteItemSchema).optional(),
}).refine(
    (data) => (data.hardwareItems?.length || 0) + (data.installationItems?.length || 0) + (data.serviceItems?.length || 0) > 0,
    {
      message: 'Por favor, añade al menos un ítem a la cotización.',
      path: ['hardwareItems'], // Assign error to one of the fields for display
    }
);

const SectionedItemsTable = ({
  fieldArray,
  watchName,
  control,
  form,
  title,
  availableItems
}: {
  fieldArray: ReturnType<typeof useFieldArray<z.infer<typeof formSchema>>>;
  watchName: 'hardwareItems' | 'installationItems' | 'serviceItems';
  control: any;
  form: any;
  title: string;
  availableItems: PriceItem[];
}) => {
  const { fields, append, remove } = fieldArray;
  const watchedItems = useWatch({ control, name: watchName });

  const handleItemSelect = (index: number, priceItemId: string) => {
    const selectedItem = availableItems.find(item => item.id === priceItemId);
    if (selectedItem) {
      form.setValue(`${watchName}.${index}.description`, selectedItem.name);
      form.setValue(`${watchName}.${index}.unitPrice`, selectedItem.basePrice);
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
              <TableHead className="w-[100px]">Cantidad</TableHead>
              <TableHead className="w-[150px]">Precio Unit.</TableHead>
              <TableHead className="w-[150px] text-right">Total</TableHead>
              <TableHead className="w-[50px]"><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
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
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un ítem" />
                        </SelectTrigger>
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
                  <FormField control={control} name={`${watchName}.${index}.quantity`} render={({ field }) => <Input type="number" {...field} />} />
                </TableCell>
                <TableCell>
                  <FormField control={control} name={`${watchName}.${index}.unitPrice`} render={({ field }) => <Input type="number" {...field} readOnly />} />
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${((watchedItems?.[index]?.quantity || 0) * (watchedItems?.[index]?.unitPrice || 0)).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
             {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground pt-8">
                  No hay ítems en esta sección.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-start border-t p-6">
        <Button type="button" variant="outline" size="sm" onClick={() => append({ priceItemId: '', description: '', quantity: 1, unitPrice: 0, total: 0 })}>
          <PlusCircle className="h-4 w-4 mr-2"/> Añadir Ítem
        </Button>
      </CardFooter>
    </Card>
  );
};


export function QuoteForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);

  const leadsCollectionRef = useMemoFirebase(() => collection(firestore, 'leads'), [firestore]);
  const { data: leads } = useCollection<Lead>(leadsCollectionRef);

  const priceItemsCollectionRef = useMemoFirebase(() => collection(firestore, 'priceItems'), [firestore]);
  const { data: priceItems, isLoading: arePriceItemsLoading } = useCollection<PriceItem>(priceItemsCollectionRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hardwareItems: [],
      installationItems: [],
      serviceItems: [],
      issueDate: new Date(),
    },
  });
  
  const selectedSolution = form.watch('solution');

  const filteredPriceItems = useMemo(() => {
    if (!priceItems || !selectedSolution) return { hardware: [], installation: [], service: [] };
    const hardware: PriceItem[] = [];
    const installation: PriceItem[] = [];
    const service: PriceItem[] = [];

    priceItems.forEach(item => {
      if (item.solution === selectedSolution) {
        if (item.type === 'Hardware') hardware.push(item);
        else if (item.type === 'Instalación') installation.push(item);
        else if (item.type === 'Servicio') service.push(item);
      }
    });

    return { hardware, installation, service };
  }, [priceItems, selectedSolution]);


  const uniqueSolutions = useMemo(() => {
    if (!priceItems) return [];
    const solutionSet = new Set(priceItems.map(item => item.solution));
    return Array.from(solutionSet);
  }, [priceItems]);


  const hardwareFieldArray = useFieldArray({ control: form.control, name: 'hardwareItems' });
  const installationFieldArray = useFieldArray({ control: form.control, name: 'installationItems' });
  const serviceFieldArray = useFieldArray({ control: form.control, name: 'serviceItems' });
  
  const watchedHardware = form.watch('hardwareItems');
  const watchedInstallation = form.watch('installationItems');
  const watchedServices = form.watch('serviceItems');
  
  const calculateTotal = (items: QuoteItem[] | undefined) => items ? items.reduce((acc, item) => acc + ((item.quantity || 0) * (item.unitPrice || 0)), 0) : 0;

  const subtotal = calculateTotal(watchedHardware) + calculateTotal(watchedInstallation) + calculateTotal(watchedServices);
  const taxAmount = subtotal * 0.16;
  const total = subtotal + taxAmount;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para crear una cotización.' });
      return;
    }
    setIsLoading(true);

    const quoteNumber = `Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;

    const newQuote = {
        ...values,
        issueDate: formatISO(values.issueDate),
        validUntil: formatISO(values.validUntil),
        quoteNumber,
        subtotal,
        tax: taxAmount,
        total,
        status: 'Borrador',
        ownerId: user.uid,
    };

    const quotesCollectionRef = collection(firestore, 'quotes');
    addDoc(quotesCollectionRef, newQuote).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: quotesCollectionRef.path,
        operation: 'create',
        requestResourceData: newQuote,
      }));
    });

    toast({
        title: "Cotización Creada Exitosamente",
        description: `La cotización ${quoteNumber} ha sido guardada.`,
    });
    router.push('/dashboard/quotes');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Cotización</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                <FormField
                    control={form.control}
                    name="leadId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Cliente/Prospecto</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un prospecto" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {leads?.map(lead => (
                                <SelectItem key={lead.id} value={lead.id}>{lead.companyName} ({lead.contactName})</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="solution"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Solución</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    name="issueDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Emisión</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                ) : (
                                    <span>Elige una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                initialFocus
                                locale={es}
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
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
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                ) : (
                                    <span>Elige una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                locale={es}
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
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
          />

          <SectionedItemsTable 
            fieldArray={installationFieldArray}
            watchName="installationItems"
            control={form.control}
            form={form}
            title="Costos de Implementación"
            availableItems={filteredPriceItems.installation}
          />
          
          <SectionedItemsTable 
            fieldArray={serviceFieldArray}
            watchName="serviceItems"
            control={form.control}
            form={form}
            title="Servicios Adicionales"
            availableItems={filteredPriceItems.service}
          />
          
          <Card>
            <CardHeader>
                <CardTitle>Resumen Total</CardTitle>
            </CardHeader>
              <CardContent className="flex justify-end">
                <div className="space-y-2 text-right w-full max-w-sm">
                    <div className="flex justify-between"><span>Subtotal:</span> <span className="font-medium">${subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>IVA (16%):</span> <span className="font-medium">${taxAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2"><span>Total:</span> <span>${total.toFixed(2)}</span></div>
                </div>
            </CardContent>
          </Card>
            
          <FormMessage>{form.formState.errors.hardwareItems?.message}</FormMessage>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cotización
            </Button>
          </div>
        </div>
        <div className="lg:col-span-1">
            <DiscountSuggester quoteAmount={total} />
        </div>
      </form>
    </Form>
  );
}
