import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().trim().min(2, 'Name must have at least 2 characters'),
  document: z
    .string()
    .trim()
    .regex(/^\d{14}$/, 'Document (CNPJ) must contain exactly 14 digits'),
  email: z.email('Invalid email address'),
  active: z.boolean(),
  authorizedTransportTypeIds: z
    .array(z.string())
    .min(1, 'Select at least one authorized transport type'),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
