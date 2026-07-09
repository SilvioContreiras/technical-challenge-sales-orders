import type { SalesOrderStatus } from '@/shared/types';

/**
 * Sales order state machine.
 *
 * The lifecycle is strictly linear and forward-only:
 *   CREATED -> PLANNED -> SCHEDULED -> IN_TRANSIT -> DELIVERED
 *
 * Any transition outside this sequence is invalid and must be rejected. The
 * transition table is data-driven so the rules can evolve (e.g. adding a
 * cancellation branch) without changing consuming code.
 */
export const ALLOWED_TRANSITIONS: Record<SalesOrderStatus, readonly SalesOrderStatus[]> = {
  CREATED: ['PLANNED'],
  PLANNED: ['SCHEDULED'],
  SCHEDULED: ['IN_TRANSIT'],
  IN_TRANSIT: ['DELIVERED'],
  DELIVERED: [],
};

export class InvalidTransitionError extends Error {
  readonly from: SalesOrderStatus;
  readonly to: SalesOrderStatus;

  constructor(from: SalesOrderStatus, to: SalesOrderStatus) {
    super(`Transição de status inválida: ${from} -> ${to}`);
    this.name = 'InvalidTransitionError';
    this.from = from;
    this.to = to;
  }
}

export function canTransition(from: SalesOrderStatus, to: SalesOrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function getNextStatus(from: SalesOrderStatus): SalesOrderStatus | null {
  return ALLOWED_TRANSITIONS[from][0] ?? null;
}

export function assertTransition(from: SalesOrderStatus, to: SalesOrderStatus): void {
  if (!canTransition(from, to)) {
    throw new InvalidTransitionError(from, to);
  }
}

export function isTerminal(status: SalesOrderStatus): boolean {
  return ALLOWED_TRANSITIONS[status].length === 0;
}
