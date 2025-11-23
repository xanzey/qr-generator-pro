import { z } from 'zod';

export const adharSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  dob: z.date({
    required_error: 'A date of birth is required.',
  }),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Gender is required.' }),
  adharNumber: z.string().regex(/^\d{4}\s\d{4}\s\d{4}$/, 'Invalid Aadhaar format (e.g., 1234 5678 9012).'),
  address: z.string().min(10, 'Address must be at least 10 characters long.'),
  photo: z.any().optional(),
  fontSize: z.number().min(8).max(16).default(10),
  showQrCode: z.boolean().default(true),
});

export type AdharFormData = z.infer<typeof adharSchema>;
