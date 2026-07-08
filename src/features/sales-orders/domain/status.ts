import type { SalesOrderStatus } from '@/shared/types';

/** Canonical order of the lifecycle, used for display and progress rendering. */
export const STATUS_SEQUENCE: readonly SalesOrderStatus[] = [
  'CREATED',
  'PLANNED',
  'SCHEDULED',
  'IN_TRANSIT',
  'DELIVERED',
] as const;

/** UI-facing labels for each status. */
export const STATUS_LABELS: Record<SalesOrderStatus, string> = {
  CREATED: 'Criada',
  PLANNED: 'Planejada',
  SCHEDULED: 'Agendada',
  IN_TRANSIT: 'Em transporte',
  DELIVERED: 'Entregue',
};

/** Tailwind badge classes per status. */
export const STATUS_BADGE_CLASSES: Record<SalesOrderStatus, string> = {
  CREATED: 'bg-slate-100 text-slate-700',
  PLANNED: 'bg-brand-100 text-brand-700',
  SCHEDULED: 'bg-amber-100 text-amber-700',
  IN_TRANSIT: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
};
