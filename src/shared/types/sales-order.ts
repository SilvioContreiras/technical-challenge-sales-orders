import type { Id, IsoDate, Timestamped } from './common';

export type SalesOrderStatus = 'CREATED' | 'PLANNED' | 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED';

export type ServiceWindow = 'MORNING' | 'AFTERNOON' | 'EVENING';

export interface SalesOrderItem {
  itemId: Id;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Schedule {
  deliveryDate: IsoDate;
  window: ServiceWindow;
  confirmed: boolean;
}

export interface SalesOrder extends Timestamped {
  id: Id;
  code: string;
  customerId: Id;
  transportTypeId: Id;
  items: SalesOrderItem[];
  status: SalesOrderStatus;
  schedule: Schedule | null;
}

export interface SalesOrderFilters {
  status?: SalesOrderStatus;
  customerId?: string;
  transportTypeId?: string;
  dateFrom?: string;
  dateTo?: string;
}
