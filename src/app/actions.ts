
'use server';

import { refineAdharDetails } from '@/ai/flows/refine-adhar-details';
import type { RefineAdharDetailsInput } from '@/ai/flows/refine-adhar-details';

export async function refineDetailsAction(input: RefineAdharDetailsInput) {
  try {
    const result = await refineAdharDetails(input);
    return result;
  } catch (error) {
    console.error('Error refining details:', error);
    return null;
  }
}
