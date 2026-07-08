import type { Id, Timestamped } from './common';

export type UnitOfMeasure = 'UN' | 'KG' | 'BOX' | 'PALLET' | 'LITER';

/**
 * Catalog item. Items are assumed to pre-exist in the system and are
 * referenced by sales orders through their unique SKU.
 */
export interface Item extends Timestamped {
  id: Id;
  /** Stock Keeping Unit — unique business identifier. */
  sku: string;
  name: string;
  description?: string;
  unitOfMeasure: UnitOfMeasure;
  unitPrice: number;
}
