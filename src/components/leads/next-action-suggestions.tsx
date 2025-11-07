'use client';

import { useState } from 'react';
import { Lightbulb, LoaderCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getNextActionSuggestions } from '@/app/actions/suggest-actions';
import type { Activity } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function NextActionSuggestions({ leadId, activities }: { leadId: string, activities: Activity[] }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setSuggestions([]);
    
    const recentInteractions = activities.map(a => `${a.type} el ${new Date(a.date).toLocaleDateString()}: ${a.notes}`);
    
    const result = await getNextActionSuggestions(leadId, recentInteractions);

    if (result.success && result.suggestions) {
      setSuggestions(result.suggestions);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }

    setIsLoading(false);
  };

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-primary" />
          Sugerencias de Próxima Acción
        </CardTitle>
        <CardDescription>
          Usa IA para obtener ideas sobre tu próximo movimiento con este prospecto.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length > 0 && (
          <Alert>
            <AlertTitle>Acciones Sugeridas</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                {suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <Button onClick={handleGetSuggestions} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            'Sugerir Próximas Acciones'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
