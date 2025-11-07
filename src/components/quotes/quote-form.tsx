'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { leads } from '@/lib/data';
import { cn } from '@/lib/utils';
import { DiscountSuggester } from './discount-suggester';

const quoteItemSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida'),
  quantity: z.coerce.number().min(1, 'La cantidad debe ser al menos 1'),
  unitPrice: z.coerce.number().min(0, 'El precio unitario debe ser positivo'),
});

const formSchema = z.object({
  leadId: z.string({ required_error: 'Por favor, selecciona un prospecto.' }),
  issueDate: z.date({ required_error: 'La fecha de emisión es requerida.' }),
  validUntil: z.date({ required_error: 'La fecha de vencimiento es requerida.' }),
  items: z.array(quoteItemSchema).min(1, 'Por favor, añade al menos un artículo.'),
});

export function QuoteForm() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const watchItems = form.watch('items');
  const subtotal = watchItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const taxAmount = subtotal * 0.16; // Asumiendo 16% de IVA
  const total = subtotal + taxAmount;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log({ ...values, subtotal, taxAmount, total });
    toast({
        title: "Cotización Creada Exitosamente",
        description: "Tu nueva cotización ha sido guardada.",
    });
    router.push('/dashboard/quotes');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
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
                            {leads.map(lead => (
                                <SelectItem key={lead.id} value={lead.id}>{lead.companyName}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <div />
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
          <Card>
            <CardHeader>
                <CardTitle>Artículos</CardTitle>
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
                                    <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => <Input {...field} placeholder="Servicio o Producto..." />} />
                                </TableCell>
                                <TableCell>
                                    <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => <Input type="number" {...field} />} />
                                </TableCell>
                                <TableCell>
                                    <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field }) => <Input type="number" {...field} />} />
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    ${((watchItems[index]?.quantity || 0) * (watchItems[index]?.unitPrice || 0)).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="justify-between border-t p-6">
                <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}>
                    <PlusCircle className="h-4 w-4 mr-2"/> Añadir Artículo
                </Button>
                <div className="space-y-2 text-right">
                    <div className="text-sm">Subtotal: <span className="font-medium">${subtotal.toFixed(2)}</span></div>
                    <div className="text-sm">IVA (16%): <span className="font-medium">${taxAmount.toFixed(2)}</span></div>
                    <div className="text-lg font-bold">Total: <span className="font-medium">${total.toFixed(2)}</span></div>
                </div>
            </CardFooter>
          </Card>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit">Guardar Cotización</Button>
          </div>
        </div>

        <div className="lg:col-span-1">
            <DiscountSuggester quoteAmount={total} />
        </div>
      </form>
    </Form>
  );
}
