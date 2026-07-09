import type { AuditEvent, Customer, Item, SalesOrder, TransportType } from '@/shared/types';

export interface Database {
  customers: Customer[];
  transportTypes: TransportType[];
  items: Item[];
  salesOrders: SalesOrder[];
  auditEvents: AuditEvent[];
  /** Monotonic counter backing human-friendly order codes (SO-0001, ...). */
  orderSequence: number;
}

const SEED_TIMESTAMP = '2026-01-05T09:00:00.000Z';

function seedTransportTypes(): TransportType[] {
  return [
    { id: 'tt-truck', name: 'Caminhão', code: 'TRUCK', active: true },
    { id: 'tt-semi', name: 'Carreta', code: 'SEMI', active: true },
    { id: 'tt-bitruck', name: 'Bitruck', code: 'BITRUCK', active: true },
    { id: 'tt-van', name: 'Van', code: 'VAN', active: false },
  ].map((tt) => ({ ...tt, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP }));
}

function seedCustomers(): Customer[] {
  return [
    {
      id: 'cust-acme',
      name: 'ACME Distribution',
      document: '12345678000199',
      email: 'logistics@acme.example',
      active: true,
      authorizedTransportTypeIds: ['tt-truck', 'tt-semi', 'tt-bitruck'],
    },
    {
      id: 'cust-globex',
      name: 'Globex Retail',
      document: '98765432000155',
      email: 'supply@globex.example',
      active: true,
      authorizedTransportTypeIds: ['tt-truck', 'tt-van'],
    },
    {
      id: 'cust-initech',
      name: 'Initech Foods',
      document: '45678912000122',
      email: 'orders@initech.example',
      active: true,
      authorizedTransportTypeIds: ['tt-semi'],
    },
  ].map((c) => ({ ...c, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP }));
}

function seedItems(): Item[] {
  const items: Omit<Item, 'createdAt' | 'updatedAt'>[] = [
    {
      id: 'item-1',
      sku: 'SKU-1001',
      name: 'Parafuso de aço M8',
      unitOfMeasure: 'BOX',
      unitPrice: 24.9,
    },
    {
      id: 'item-2',
      sku: 'SKU-1002',
      name: 'Chapa de alumínio 2mm',
      unitOfMeasure: 'UN',
      unitPrice: 89.5,
    },
    {
      id: 'item-3',
      sku: 'SKU-1003',
      name: 'Cano de PVC 100mm',
      unitOfMeasure: 'UN',
      unitPrice: 42.0,
    },
    {
      id: 'item-4',
      sku: 'SKU-1004',
      name: 'Lubrificante industrial',
      unitOfMeasure: 'LITER',
      unitPrice: 18.75,
    },
    {
      id: 'item-5',
      sku: 'SKU-1005',
      name: 'Palete de madeira',
      unitOfMeasure: 'PALLET',
      unitPrice: 55.0,
    },
    {
      id: 'item-6',
      sku: 'SKU-1006',
      name: 'Fio de cobre 10m',
      unitOfMeasure: 'UN',
      unitPrice: 33.2,
    },
  ];
  return items.map((i) => ({ ...i, createdAt: SEED_TIMESTAMP, updatedAt: SEED_TIMESTAMP }));
}

function seedSalesOrders(): SalesOrder[] {
  return [
    {
      id: 'so-1',
      code: 'SO-0001',
      customerId: 'cust-acme',
      transportTypeId: 'tt-truck',
      status: 'CREATED',
      schedule: null,
      items: [
        {
          itemId: 'item-1',
          sku: 'SKU-1001',
          name: 'Parafuso de aço M8',
          quantity: 10,
          unitPrice: 24.9,
        },
        {
          itemId: 'item-3',
          sku: 'SKU-1003',
          name: 'Cano de PVC 100mm',
          quantity: 4,
          unitPrice: 42.0,
        },
      ],
      createdAt: '2026-01-06T10:00:00.000Z',
      updatedAt: '2026-01-06T10:00:00.000Z',
    },
    {
      id: 'so-2',
      code: 'SO-0002',
      customerId: 'cust-globex',
      transportTypeId: 'tt-van',
      status: 'SCHEDULED',
      schedule: { deliveryDate: '2026-02-15', window: 'MORNING', confirmed: true },
      items: [
        {
          itemId: 'item-2',
          sku: 'SKU-1002',
          name: 'Chapa de alumínio 2mm',
          quantity: 20,
          unitPrice: 89.5,
        },
      ],
      createdAt: '2026-01-07T14:30:00.000Z',
      updatedAt: '2026-01-10T08:15:00.000Z',
    },
    {
      id: 'so-3',
      code: 'SO-0003',
      customerId: 'cust-initech',
      transportTypeId: 'tt-semi',
      status: 'IN_TRANSIT',
      schedule: { deliveryDate: '2026-02-01', window: 'AFTERNOON', confirmed: true },
      items: [
        {
          itemId: 'item-4',
          sku: 'SKU-1004',
          name: 'Lubrificante industrial',
          quantity: 50,
          unitPrice: 18.75,
        },
        {
          itemId: 'item-5',
          sku: 'SKU-1005',
          name: 'Palete de madeira',
          quantity: 8,
          unitPrice: 55.0,
        },
      ],
      createdAt: '2026-01-08T09:45:00.000Z',
      updatedAt: '2026-01-12T16:20:00.000Z',
    },
  ];
}

function seedAuditEvents(): AuditEvent[] {
  return [
    {
      id: 'ae-1',
      timestamp: '2026-01-06T10:00:00.000Z',
      action: 'ORDER_CREATED',
      entity: 'SALES_ORDER',
      entityId: 'so-1',
      entityLabel: 'SO-0001',
      previousState: null,
      nextState: 'CREATED',
    },
    {
      id: 'ae-2',
      timestamp: '2026-01-10T08:15:00.000Z',
      action: 'STATUS_CHANGED',
      entity: 'SALES_ORDER',
      entityId: 'so-2',
      entityLabel: 'SO-0002',
      previousState: 'PLANNED',
      nextState: 'SCHEDULED',
    },
  ];
}

export function seedDatabase(): Database {
  return {
    transportTypes: seedTransportTypes(),
    customers: seedCustomers(),
    items: seedItems(),
    salesOrders: seedSalesOrders(),
    auditEvents: seedAuditEvents(),
    orderSequence: 3,
  };
}

export let db: Database = seedDatabase();

/** Re-seeds the database. Used to isolate test cases. */
export function resetDatabase(): void {
  db = seedDatabase();
}
