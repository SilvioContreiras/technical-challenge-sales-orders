import type { Id, Timestamped } from './common';

/**
 * Modeled as data — not a hardcoded enum — so new modalities can be added
 * without touching business rules.
 */
export interface TransportType extends Timestamped {
  id: Id;
  name: string;
  code: string;
  active: boolean;
}
