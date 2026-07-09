import type { Id, IsoDateTime } from './common';

export type AuditAction =
  'ORDER_CREATED' | 'STATUS_CHANGED' | 'SCHEDULE_CHANGED' | 'TRANSPORT_CHANGED';

export type AuditEntity = 'SALES_ORDER';

export interface AuditEvent {
  id: Id;
  timestamp: IsoDateTime;
  action: AuditAction;
  entity: AuditEntity;
  entityId: Id;
  entityLabel: string;
  previousState: string | null;
  nextState: string | null;
}
