import type { SalesOrderStatus, Schedule, ServiceWindow } from '@/shared/types';

export const WINDOW_LABELS: Record<ServiceWindow, string> = {
  MORNING: 'Manhã (08:00–12:00)',
  AFTERNOON: 'Tarde (12:00–18:00)',
  EVENING: 'Noite (18:00–22:00)',
};

export function hasConfirmedSchedule(schedule: Schedule | null | undefined): boolean {
  return Boolean(schedule?.confirmed);
}

/** Confirmed schedule is required when entering or leaving SCHEDULED. */
export function transitionRequiresConfirmedSchedule(
  from: SalesOrderStatus,
  to: SalesOrderStatus,
): boolean {
  return to === 'SCHEDULED' || from === 'SCHEDULED';
}
