import type { Customer, Id, SalesOrderItem } from '@/shared/types';

/** Business rule: an order must contain at least one item. */
export function hasAtLeastOneItem(items: readonly unknown[]): boolean {
  return items.length > 0;
}

/**
 * Business rule: a sales order can only use a transport type that is
 * explicitly authorized for the selected customer.
 */
export function isTransportAuthorizedForCustomer(
  customer: Pick<Customer, 'authorizedTransportTypeIds'>,
  transportTypeId: Id,
): boolean {
  return customer.authorizedTransportTypeIds.includes(transportTypeId);
}

/** Total monetary value of the order's items. */
export function calculateOrderTotal(items: SalesOrderItem[]): number {
  return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}
