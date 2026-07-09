import type { Id, Timestamped } from './common';

export interface Customer extends Timestamped {
  id: Id;
  name: string;
  document: string;
  email: string;
  active: boolean;
  /**
   * Transport types the customer is authorized to use. A sales order can only
   * be created with a transport type present in this list (business rule).
   */
  authorizedTransportTypeIds: Id[];
}
