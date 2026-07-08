import { z } from 'zod';

export const transportTypeSchema = z.object({
  name: z.string().trim().min(2, 'Name must have at least 2 characters'),
  code: z
    .string()
    .trim()
    .min(2, 'Code must have at least 2 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Code may only contain letters, numbers, hyphen and underscore'),
  active: z.boolean(),
});

export type TransportTypeFormValues = z.infer<typeof transportTypeSchema>;
