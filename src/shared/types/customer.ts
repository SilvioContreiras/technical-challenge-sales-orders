import type { Id, Timestamped } from './common';

export interface Customer extends Timestamped {
  id: Id;
  name: string;
  /** Brazilian company registration number (CNPJ), digits only. */
  document: string;
  email: string;
  active: boolean;
  /**
   * Transport types the customer is authorized to use. A sales order can only
   * be created with a transport type present in this list (business rule).
   */
  authorizedTransportTypeIds: Id[];
}
