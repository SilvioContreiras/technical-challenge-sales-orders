import { z } from 'zod';

export const transportTypeSchema = z.object({
  name: z.string().trim().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  code: z
    .string()
    .trim()
    .min(2, 'O código deve ter pelo menos 2 caracteres')
    .regex(/^[A-Za-z0-9_-]+$/, 'O código pode conter apenas letras, números, hífen e sublinhado'),
  active: z.boolean(),
});

export type TransportTypeFormValues = z.infer<typeof transportTypeSchema>;
