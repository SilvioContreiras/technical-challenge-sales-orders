import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().trim().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  document: z
    .string()
    .trim()
    .regex(/^\d{14}$/, 'O documento (CNPJ) deve conter exatamente 14 dígitos'),
  email: z.email('Endereço de e-mail inválido'),
  active: z.boolean(),
  authorizedTransportTypeIds: z
    .array(z.string())
    .min(1, 'Selecione pelo menos um tipo de transporte autorizado'),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
