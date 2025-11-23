
'use server';

/**
 * @fileOverview This file contains the Genkit flow for refining Adhar card details using AI.
 *
 * It includes:
 * - refineAdharDetails - The main function to refine Adhar details.
 * - RefineAdharDetailsInput - The input type for the refineAdharDetails function.
 * - RefineAdharDetailsOutput - The output type for the refineAdharDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineAdharDetailsInputSchema = z.object({
  name: z.string().describe('The name in English extracted from the Adhar card image.'),
  nameHindi: z.string().describe('The name in Hindi extracted from the Adhar card image.'),
  address: z.string().describe('The address in English extracted from the Adhar card image.'),
  addressHindi: z.string().describe('The address in Hindi extracted from the Adhar card image.'),
});
export type RefineAdharDetailsInput = z.infer<typeof RefineAdharDetailsInputSchema>;

const RefineAdharDetailsOutputSchema = z.object({
  refinedName: z.string().describe('The refined English name after AI processing.'),
  refinedNameHindi: z.string().describe('The refined Hindi name after AI processing.'),
  refinedAddress: z.string().describe('The refined English address after AI processing.'),
  refinedAddressHindi: z.string().describe('The refined Hindi address after AI processing.'),
});
export type RefineAdharDetailsOutput = z.infer<typeof RefineAdharDetailsOutputSchema>;

export async function refineAdharDetails(input: RefineAdharDetailsInput): Promise<RefineAdharDetailsOutput> {
  return refineAdharDetailsFlow(input);
}

const refineAdharDetailsPrompt = ai.definePrompt({
  name: 'refineAdharDetailsPrompt',
  input: {schema: RefineAdharDetailsInputSchema},
  output: {schema: RefineAdharDetailsOutputSchema},
  prompt: `You are an AI assistant specializing in refining names and addresses for Indian Aadhaar cards, including translation and transliteration between English and Hindi.

  Given the potentially incomplete or inaccurate names and addresses in English and/or Hindi, your task is to:
  1. Correct any spelling or formatting errors in both languages.
  2. If one language field is empty or incomplete, generate the corresponding correct version in the other language. (e.g., if English name is provided, generate the Hindi name).
  3. Ensure the final output is accurate and properly formatted for an Aadhaar card.

  English Name: {{{name}}}
  Hindi Name: {{{nameHindi}}}
  English Address: {{{address}}}
  Hindi Address: {{{addressHindi}}}

  Please provide a refined and completed version for all four fields.
  The output must be a valid JSON object formatted like this:
  {
    "refinedName": "<Refined English Name>",
    "refinedNameHindi": "<Refined Hindi Name>",
    "refinedAddress": "<Refined English Address>",
    "refinedAddressHindi": "<Refined Hindi Address>"
  }`,
});

const refineAdharDetailsFlow = ai.defineFlow(
  {
    name: 'refineAdharDetailsFlow',
    inputSchema: RefineAdharDetailsInputSchema,
    outputSchema: RefineAdharDetailsOutputSchema,
  },
  async input => {
    const {output} = await refineAdharDetailsPrompt(input);
    return output!;
  }
);
