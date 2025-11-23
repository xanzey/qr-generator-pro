
import { z } from 'zod';

export const adharSchema = z.object({
  name: z.string().min(3, 'English name must be at least 3 characters.'),
  nameHindi: z.string().min(3, 'Hindi name must be at least 3 characters.'),
  dob: z.date({
    required_error: 'A date of birth is required.',
  }),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Gender is required.' }),
  adharNumber: z.string().regex(/^\d{4}\s\d{4}\s\d{4}$/, 'Invalid Aadhaar format (e.g., 1234 5678 9012).'),
  vid: z.string().regex(/^(\d{4}\s){3}\d{4}$/, 'Invalid VID format (e.g., 1234 5678 9012 3456).').optional().or(z.literal('')),
  address: z.string().min(10, 'English address must be at least 10 characters long.'),
  addressHindi: z.string().min(10, 'Hindi address must be at least 10 characters long.'),
  photo: z.any().optional(),
  fontSize: z.number().min(8).max(16).default(10),
  showQrCode: z.boolean().default(true),
});

export type AdharFormData = z.infer<typeof adharSchema>;
    