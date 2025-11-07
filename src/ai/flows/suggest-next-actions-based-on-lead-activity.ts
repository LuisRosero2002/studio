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
  leadId: z.string().describe('The ID of the lead.'),
  recentInteractions: z.array(z.string()).describe('A list of recent interactions with the lead.'),
});
export type SuggestNextActionsInput = z.infer<typeof SuggestNextActionsInputSchema>;

const SuggestNextActionsOutputSchema = z.object({
  suggestedActions: z.array(z.string()).describe('A list of suggested next actions for the lead.'),
});
export type SuggestNextActionsOutput = z.infer<typeof SuggestNextActionsOutputSchema>;

export async function suggestNextActions(input: SuggestNextActionsInput): Promise<SuggestNextActionsOutput> {
  return suggestNextActionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNextActionsPrompt',
  input: {schema: SuggestNextActionsInputSchema},
  output: {schema: SuggestNextActionsOutputSchema},
  prompt: `You are an AI assistant helping sales representatives to manage their leads more efficiently. Based on the recent interactions with the lead, suggest the next best actions to take.

Lead ID: {{{leadId}}}
Recent Interactions:
{{#each recentInteractions}}
- {{{this}}}
{{/each}}

Suggest at least three possible next actions, considering different options to advance the lead towards conversion. Be concise and actionable.

Here's an example:
Recent Interactions:
- Called the lead and left a voicemail.
- Sent an introductory email.

Suggested Actions:
- Schedule a follow-up call.
- Send a case study relevant to the lead's industry.
- Offer a product demo.
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
