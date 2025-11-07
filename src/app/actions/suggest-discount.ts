
'use server';
import { suggestDiscountAmountForQuote, SuggestDiscountAmountForQuoteInput } from '@/ai/flows/suggest-discount-amount-for-quote.ts';

export async function getDiscountSuggestion(input: SuggestDiscountAmountForQuoteInput) {
  try {
    const result = await suggestDiscountAmountForQuote(input);
    return { success: true, suggestion: result };
  } catch (error) {
    console.error('Error getting discount suggestion:', error);
    return { success: false, error: 'Failed to get discount suggestion. Please try again.' };
  }
}
