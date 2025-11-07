'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest next actions for a lead based on recent interactions.
 *
 * - suggestNextActions - A function that suggests next actions based on lead activity.
 * - SuggestNextActionsInput - The input type for the suggestNextActions function.
 * - SuggestNextActionsOutput - The return type for the suggestNextActions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNextActionsInputSchema = z.object({
  leadId: z.string().describe('El ID del prospecto.'),
  recentInteractions: z.array(z.string()).describe('Una lista de interacciones recientes con el prospecto.'),
});
export type SuggestNextActionsInput = z.infer<typeof SuggestNextActionsInputSchema>;

const SuggestNextActionsOutputSchema = z.object({
  suggestedActions: z.array(z.string()).describe('Una lista de las siguientes acciones sugeridas para el prospecto.'),
});
export type SuggestNextActionsOutput = z.infer<typeof SuggestNextActionsOutputSchema>;

export async function suggestNextActions(input: SuggestNextActionsInput): Promise<SuggestNextActionsOutput> {
  return suggestNextActionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNextActionsPrompt',
  input: {schema: SuggestNextActionsInputSchema},
  output: {schema: SuggestNextActionsOutputSchema},
  prompt: `Eres un asistente de IA que ayuda a los representantes de ventas a gestionar sus prospectos de manera más eficiente. Basado en las interacciones recientes con el prospecto, sugiere las siguientes mejores acciones a tomar.

ID del Prospecto: {{{leadId}}}
Interacciones Recientes:
{{#each recentInteractions}}
- {{{this}}}
{{/each}}

Sugiere al menos tres posibles acciones siguientes, considerando diferentes opciones para hacer avanzar al prospecto hacia la conversión. Sé conciso y práctico.

Aquí tienes un ejemplo:
Interacciones Recientes:
- Se llamó al prospecto y se dejó un mensaje de voz.
- Se envió un correo electrónico de presentación.

Acciones Sugeridas:
- Programar una llamada de seguimiento.
- Enviar un caso de estudio relevante para la industria del prospecto.
- Ofrecer una demostración del producto.
`,
});

const suggestNextActionsFlow = ai.defineFlow(
  {
    name: 'suggestNextActionsFlow',
    inputSchema: SuggestNextActionsInputSchema,
    outputSchema: SuggestNextActionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
