import { z } from 'zod';

export const UNIT_OF_MEASURE_VALUES = ['UN', 'KG', 'BOX', 'PALLET', 'LITER'] as const;

export const itemSchema = z.object({
  sku: z.string().trim().min(3, 'O SKU deve ter pelo menos 3 caracteres'),
  name: z.string().trim().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  description: z.string().trim().optional(),
  unitOfMeasure: z.enum(UNIT_OF_MEASURE_VALUES),
  unitPrice: z
    .number({ message: 'O preço unitário é obrigatório' })
    .positive('O preço unitário deve ser maior que zero'),
});

export type ItemFormValues = z.infer<typeof itemSchema>;
