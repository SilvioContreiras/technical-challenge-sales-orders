import type { Customer, Id, SalesOrderItem } from '@/shared/types';

export function hasAtLeastOneItem(items: readonly unknown[]): boolean {
  return items.length > 0;
}

export function isTransportAuthorizedForCustomer(
  customer: Pick<Customer, 'authorizedTransportTypeIds'>,
  transportTypeId: Id,
): boolean {
  return customer.authorizedTransportTypeIds.includes(transportTypeId);
}

export function calculateOrderTotal(items: SalesOrderItem[]): number {
  return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}
