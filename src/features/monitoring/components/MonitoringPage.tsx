import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  Field,
  Input,
  LoadingState,
  Select,
  type Column,
} from '@/shared/components/ui';
import { formatDate } from '@/shared/utils/format';
import { getErrorMessage } from '@/shared/lib/errors';
import type { SalesOrder, SalesOrderStatus } from '@/shared/types';
import { useCustomers } from '@/features/customers/queries';
import { useTransportTypes } from '@/features/transport-types/queries';
import { useSalesOrders } from '@/features/sales-orders/queries';
import type { SalesOrderFilters } from '@/features/sales-orders/api';
import { STATUS_LABELS, STATUS_SEQUENCE } from '@/features/sales-orders/domain/status';
import { StatusBadge } from '@/features/sales-orders/components/StatusBadge';

const emptyFilters: SalesOrderFilters = {};

export function MonitoringPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SalesOrderFilters>(emptyFilters);

  const ordersQuery = useSalesOrders(filters);
  const customersQuery = useCustomers();
  const transportTypesQuery = useTransportTypes();

  const customerName = useMemo(() => {
    const map = new Map((customersQuery.data ?? []).map((c) => [c.id, c.name]));
    return (id: string) => map.get(id) ?? '—';
  }, [customersQuery.data]);

  const transportName = useMemo(() => {
    const map = new Map((transportTypesQuery.data ?? []).map((t) => [t.id, t.name]));
    return (id: string) => map.get(id) ?? '—';
  }, [transportTypesQuery.data]);

  function update(patch: Partial<SalesOrderFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  const hasFilters = Object.values(filters).some(Boolean);

  const columns: Column<SalesOrder>[] = [
    { header: 'Code', cell: (o) => <span className="font-medium text-slate-900">{o.code}</span> },
    { header: 'Customer', cell: (o) => customerName(o.customerId) },
    { header: 'Transport', cell: (o) => transportName(o.transportTypeId) },
    { header: 'Status', cell: (o) => <StatusBadge status={o.status} /> },
    {
      header: 'Delivery date',
      cell: (o) => (o.schedule ? formatDate(o.schedule.deliveryDate) : '—'),
    },
    { header: 'Created', cell: (o) => formatDate(o.createdAt) },
  ];

  return (
    <div>
      <PageHeader
        title="Operational Monitoring"
        description="Filter sales orders by status, customer, transport type and date."
      />

      <Card className="mb-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Status" htmlFor="filter-status">
            <Select
              id="filter-status"
              value={filters.status ?? ''}
              onChange={(event) =>
                update({
                  status: (event.target.value || undefined) as SalesOrderStatus | undefined,
                })
              }
            >
              <option value="">All</option>
              {STATUS_SEQUENCE.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Customer" htmlFor="filter-customer">
            <Select
              id="filter-customer"
              value={filters.customerId ?? ''}
              onChange={(event) => update({ customerId: event.target.value || undefined })}
            >
              <option value="">All</option>
              {(customersQuery.data ?? []).map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Transport" htmlFor="filter-transport">
            <Select
              id="filter-transport"
              value={filters.transportTypeId ?? ''}
              onChange={(event) => update({ transportTypeId: event.target.value || undefined })}
            >
              <option value="">All</option>
              {(transportTypesQuery.data ?? []).map((transport) => (
                <option key={transport.id} value={transport.id}>
                  {transport.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Created from" htmlFor="filter-from">
            <Input
              id="filter-from"
              type="date"
              value={filters.dateFrom ?? ''}
              onChange={(event) => update({ dateFrom: event.target.value || undefined })}
            />
          </Field>

          <Field label="Created to" htmlFor="filter-to">
            <Input
              id="filter-to"
              type="date"
              value={filters.dateTo ?? ''}
              onChange={(event) => update({ dateTo: event.target.value || undefined })}
            />
          </Field>
        </div>

        {hasFilters ? (
          <div className="mt-3">
            <Button variant="ghost" size="sm" onClick={() => setFilters(emptyFilters)}>
              <X className="size-4" />
              Clear filters
            </Button>
          </div>
        ) : null}
      </Card>

      <Card>
        {ordersQuery.isPending ? (
          <LoadingState label="Loading results..." />
        ) : ordersQuery.isError ? (
          <ErrorState message={getErrorMessage(ordersQuery.error)} />
        ) : ordersQuery.data.length === 0 ? (
          <EmptyState message="No orders match the selected filters." />
        ) : (
          <DataTable
            columns={columns}
            rows={ordersQuery.data}
            rowKey={(o) => o.id}
            onRowClick={(o) =>
              navigate({ to: '/sales-orders/$orderId', params: { orderId: o.id } })
            }
          />
        )}
      </Card>
    </div>
  );
}
