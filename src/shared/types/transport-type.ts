import type { Id, Timestamped } from './common';

export interface TransportType extends Timestamped {
  id: Id;
  name: string;
  code: string;
  active: boolean;
}
