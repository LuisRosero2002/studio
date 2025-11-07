
'use server';
import { suggestNextActions } from '@/ai/flows/suggest-next-actions-based-on-lead-activity';

export async function getNextActionSuggestions(leadId: string, recentInteractions: string[]) {
  try {
    const result = await suggestNextActions({ leadId, recentInteractions });
    return { success: true, suggestions: result.suggestedActions };
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return { success: false, error: 'Failed to get AI-powered suggestions. Please try again.' };
  }
}
