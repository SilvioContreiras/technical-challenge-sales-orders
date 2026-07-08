import type { Id, IsoDate, Timestamped } from './common';

/**
 * Operational lifecycle states of a sales order.
 * Values are kept in English in code; UI labels are localized separately.
 * (Domain mapping: CREATED=CRIADA, PLANNED=PLANEJADA, SCHEDULED=AGENDADA,
 * IN_TRANSIT=EM_TRANSPORTE, DELIVERED=ENTREGUE.)
 */
export type SalesOrderStatus = 'CREATED' | 'PLANNED' | 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED';

/** Delivery service window offered by the scheduling center. */
export type ServiceWindow = 'MORNING' | 'AFTERNOON' | 'EVENING';

/** A line item within a sales order. Snapshots item data at creation time. */
export interface SalesOrderItem {
  itemId: Id;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

/** Delivery schedule attached to a sales order. */
export interface Schedule {
  deliveryDate: IsoDate;
  window: ServiceWindow;
  confirmed: boolean;
}

export interface SalesOrder extends Timestamped {
  id: Id;
  /** Human-friendly identifier, e.g. `SO-0001`. */
  code: string;
  customerId: Id;
  transportTypeId: Id;
  items: SalesOrderItem[];
  status: SalesOrderStatus;
  schedule: Schedule | null;
}
