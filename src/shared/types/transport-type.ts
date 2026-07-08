import type { Id, Timestamped } from './common';

/**
 * Transport modality (e.g. Truck, Semi-trailer, Bi-truck).
 * Modeled as data — not a hardcoded enum — so new modalities can be added
 * without touching business rules.
 */
export interface TransportType extends Timestamped {
  id: Id;
  name: string;
  /** Short unique code (e.g. `TRUCK`, `SEMI`, `BITRUCK`). */
  code: string;
  active: boolean;
}
