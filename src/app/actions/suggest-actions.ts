'use server';
import { suggestNextActions } from '@/ai/flows/suggest-next-actions-based-on-lead-activity';

export async function getNextActionSuggestions(leadId: string, recentInteractions: string[]) {
  try {
    const result = await suggestNextActions({ leadId, recentInteractions });
    return { success: true, suggestions: result.suggestedActions };
  } catch (error) {
    console.error('Error al obtener sugerencias:', error);
    return { success: false, error: 'No se pudieron obtener sugerencias de la IA. Por favor, inténtalo de nuevo.' };
  }
}
