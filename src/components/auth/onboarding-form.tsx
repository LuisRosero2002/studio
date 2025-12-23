'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const roles: UserRole[] = ['Admin', 'Administrador comercial', 'Ejecutivo de Ventas', 'Soporte'];

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'El nombre completo debe tener al menos 2 caracteres.' }),
  role: z.enum(roles, { required_error: 'Por favor, selecciona un rol.' }),
  contactPhone: z.string().min(5, { message: 'Por favor, ingresa un número de teléfono válido.' }),
  sede: z.string().optional(),
});

export function OnboardingForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      contactPhone: '',
      sede: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se ha encontrado un usuario autenticado.",
        });
        return;
    }
    
    setIsLoading(true);

    const userProfileData = {
        id: user.uid,
        name: values.fullName,
        email: user.email,
        role: values.role,
        contactDetails: values.contactPhone,
        sede: values.sede,
    };
    
    const userDocRef = doc(firestore, 'users', user.uid);

    setDoc(userDocRef, userProfileData, { merge: true }).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'write',
        requestResourceData: userProfileData,
      }))
    });

    toast({
        title: "Perfil Actualizado",
        description: "¡Bienvenido! Redirigiendo a tu panel de control...",
    });

    router.push('/dashboard');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="p. ej. María Rodríguez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tu Rol</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu rol en la empresa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono de Contacto</FormLabel>
              <FormControl>
                <Input placeholder="p. ej. 555-123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sede"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sede (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="p. ej. Ciudad de México" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Completar Perfil y Continuar
        </Button>
      </form>
    </Form>
  );
}
