'use server';
import { suggestDiscountAmountForQuote, SuggestDiscountAmountForQuoteInput } from '@/ai/flows/suggest-discount-amount-for-quote.ts';

export async function getDiscountSuggestion(input: SuggestDiscountAmountForQuoteInput) {
  try {
    const result = await suggestDiscountAmountForQuote(input);
    return { success: true, suggestion: result };
  } catch (error) {
    console.error('Error al obtener sugerencia de descuento:', error);
    return { success: false, error: 'No se pudo obtener la sugerencia de descuento. Por favor, inténtalo de nuevo.' };
  }
}
