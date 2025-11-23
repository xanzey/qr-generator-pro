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
  name: z.string().describe('The name extracted from the Adhar card image.'),
  address: z.string().describe('The address extracted from the Adhar card image.'),
});
export type RefineAdharDetailsInput = z.infer<typeof RefineAdharDetailsInputSchema>;

const RefineAdharDetailsOutputSchema = z.object({
  refinedName: z.string().describe('The refined name after AI processing.'),
  refinedAddress: z.string().describe('The refined address after AI processing.'),
});
export type RefineAdharDetailsOutput = z.infer<typeof RefineAdharDetailsOutputSchema>;

export async function refineAdharDetails(input: RefineAdharDetailsInput): Promise<RefineAdharDetailsOutput> {
  return refineAdharDetailsFlow(input);
}

const refineAdharDetailsPrompt = ai.definePrompt({
  name: 'refineAdharDetailsPrompt',
  input: {schema: RefineAdharDetailsInputSchema},
  output: {schema: RefineAdharDetailsOutputSchema},
  prompt: `You are an AI assistant specializing in refining names and addresses extracted from Adhar cards.

  Given the potentially incomplete or inaccurate name and address, use your knowledge to correct and complete the information.

  Name: {{{name}}}
  Address: {{{address}}}

  Please provide a refined version of the name and address.
  The output should be a valid JSON formatted like this:
  {
  "refinedName": "<Refined Name>",
  "refinedAddress": "<Refined Address>"
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
