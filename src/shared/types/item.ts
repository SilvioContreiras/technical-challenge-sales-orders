import type { Id, Timestamped } from './common';

export type UnitOfMeasure = 'UN' | 'KG' | 'BOX' | 'PALLET' | 'LITER';

export interface Item extends Timestamped {
  id: Id;
  sku: string;
  name: string;
  description?: string;
  unitOfMeasure: UnitOfMeasure;
  unitPrice: number;
}
