import type { Id, Timestamped } from './common';

export interface Customer extends Timestamped {
  id: Id;
  name: string;
  document: string;
  email: string;
  active: boolean;
  authorizedTransportTypeIds: Id[];
}
