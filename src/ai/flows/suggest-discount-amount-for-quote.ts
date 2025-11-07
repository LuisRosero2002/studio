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
    .describe('The purchase history of the customer.'),
  productMargin: z
    .number()
    .describe('The profit margin of the product being quoted, as a percentage (e.g., 0.20 for 20%).'),
  quoteAmount: z.number().describe('The total amount of the quote.'),
});
export type SuggestDiscountAmountForQuoteInput = z.infer<
  typeof SuggestDiscountAmountForQuoteInputSchema
>;

const SuggestDiscountAmountForQuoteOutputSchema = z.object({
  suggestedDiscountAmount: z
    .number()
    .describe(
      'The suggested discount amount to offer the customer. Should be a value between 0 and the quoteAmount.'
    ),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the suggested discount amount, considering customer history and product margin.'
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
  prompt: `You are an expert sales strategist who suggests optimal discount amounts for quotes.

  Based on the customer's purchase history and the product's profit margin, suggest a discount amount that will likely close the deal while maintaining profitability.

  Consider the following:
  *   A long-standing customer with a history of large purchases may warrant a larger discount.
  *   A high product margin allows for a more generous discount.
  *   A new customer or a product with a low margin requires a more conservative discount.

  Customer History: {{{customerHistory}}}
  Product Margin: {{{productMargin}}}
  Quote Amount: {{{quoteAmount}}}

  Suggest a discount amount (in dollars) and provide a brief explanation of your reasoning.
  \nOutput in the following JSON format:
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
