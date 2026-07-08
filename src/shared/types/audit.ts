import type { Id, IsoDateTime } from './common';

export type AuditAction =
  'ORDER_CREATED' | 'STATUS_CHANGED' | 'SCHEDULE_CHANGED' | 'TRANSPORT_CHANGED';

export type AuditEntity = 'SALES_ORDER';

/**
 * A recorded, immutable audit event for traceability. Captures who/what
 * changed along with the previous and next state when applicable.
 */
export interface AuditEvent {
  id: Id;
  timestamp: IsoDateTime;
  action: AuditAction;
  entity: AuditEntity;
  entityId: Id;
  /** Human-readable label for the affected entity (e.g. order code). */
  entityLabel: string;
  previousState: string | null;
  nextState: string | null;
}
