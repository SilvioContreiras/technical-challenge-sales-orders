import { z } from 'zod';

export const salesOrderSchema = z.object({
  customerId: z.string().min(1, 'Selecione um cliente'),
  transportTypeId: z.string().min(1, 'Selecione um tipo de transporte'),
  items: z
    .array(
      z.object({
        itemId: z.string().min(1, 'Selecione um item'),
        quantity: z
          .number({ message: 'A quantidade é obrigatória' })
          .int('A quantidade deve ser um número inteiro')
          .positive('A quantidade deve ser maior que zero'),
      }),
    )
    .min(1, 'Adicione pelo menos um item'),
});

export type SalesOrderFormValues = z.infer<typeof salesOrderSchema>;

export const SERVICE_WINDOW_VALUES = ['MORNING', 'AFTERNOON', 'EVENING'] as const;

export const scheduleSchema = z.object({
  deliveryDate: z.string().min(1, 'Selecione uma data de entrega'),
  window: z.enum(SERVICE_WINDOW_VALUES),
});

export type ScheduleFormValues = z.infer<typeof scheduleSchema>;
