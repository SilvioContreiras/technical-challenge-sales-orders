import type { SalesOrderStatus } from '@/shared/types';

export const STATUS_SEQUENCE: readonly SalesOrderStatus[] = [
  'CREATED',
  'PLANNED',
  'SCHEDULED',
  'IN_TRANSIT',
  'DELIVERED',
] as const;

export const STATUS_LABELS: Record<SalesOrderStatus, string> = {
  CREATED: 'Criada',
  PLANNED: 'Planejada',
  SCHEDULED: 'Agendada',
  IN_TRANSIT: 'Em transporte',
  DELIVERED: 'Entregue',
};

export const STATUS_BADGE_CLASSES: Record<SalesOrderStatus, string> = {
  CREATED: 'bg-slate-100 text-slate-700',
  PLANNED: 'bg-brand-100 text-brand-700',
  SCHEDULED: 'bg-amber-100 text-amber-700',
  IN_TRANSIT: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
};
