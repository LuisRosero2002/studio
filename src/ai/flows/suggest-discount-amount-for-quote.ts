'use server';

/**
 * @fileOverview Suggests a discount amount for a quote based on customer history and product margin.
 *
 * - suggestDiscountAmountForQuote - A function that suggests a discount amount for a quote.
 * - SuggestDiscountAmountForQuoteInput - The input type for the suggestDiscountAmountForQuote function.
 * - SuggestDiscountAmountForQuoteOutput - The return type for the suggestDiscountAmountForQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDiscountAmountForQuoteInputSchema = z.object({
  customerHistory: z
    .string()
    .describe('El historial de compras del cliente.'),
  productMargin: z
    .number()
    .describe('El margen de ganancia del producto que se cotiza, como un porcentaje (por ejemplo, 0.20 para 20%).'),
  quoteAmount: z.number().describe('El monto total de la cotización.'),
});
export type SuggestDiscountAmountForQuoteInput = z.infer<
  typeof SuggestDiscountAmountForQuoteInputSchema
>;

const SuggestDiscountAmountForQuoteOutputSchema = z.object({
  suggestedDiscountAmount: z
    .number()
    .describe(
      'El monto de descuento sugerido para ofrecer al cliente. Debe ser un valor entre 0 y el monto de la cotización.'
    ),
  reasoning: z
    .string()
    .describe(
      'El razonamiento detrás del monto de descuento sugerido, considerando el historial del cliente y el margen del producto.'
    ),
});
export type SuggestDiscountAmountForQuoteOutput = z.infer<
  typeof SuggestDiscountAmountForQuoteOutputSchema
>;

export async function suggestDiscountAmountForQuote(
  input: SuggestDiscountAmountForQuoteInput
): Promise<SuggestDiscountAmountForQuoteOutput> {
  return suggestDiscountAmountForQuoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDiscountAmountForQuotePrompt',
  input: {schema: SuggestDiscountAmountForQuoteInputSchema},
  output: {schema: SuggestDiscountAmountForQuoteOutputSchema},
  prompt: `Eres un estratega de ventas experto que sugiere montos de descuento óptimos para cotizaciones.

  Basándote en el historial de compras del cliente y el margen de ganancia del producto, sugiere un monto de descuento que probablemente cierre el trato manteniendo la rentabilidad.

  Considera lo siguiente:
  * Un cliente antiguo con un historial de compras grandes puede justificar un descuento mayor.
  * Un margen de producto alto permite un descuento más generoso.
  * Un cliente nuevo o un producto con un margen bajo requieren un descuento más conservador.

  Historial del Cliente: {{{customerHistory}}}
  Margen del Producto: {{{productMargin}}}
  Monto de la Cotización: {{{quoteAmount}}}

  Sugiere un monto de descuento (en dólares) y proporciona una breve explicación de tu razonamiento.
  \nEl resultado debe estar en el siguiente formato JSON:
  {
    "suggestedDiscountAmount": "number",
    "reasoning": "string"
  }`,
});

const suggestDiscountAmountForQuoteFlow = ai.defineFlow(
  {
    name: 'suggestDiscountAmountForQuoteFlow',
    inputSchema: SuggestDiscountAmountForQuoteInputSchema,
    outputSchema: SuggestDiscountAmountForQuoteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
