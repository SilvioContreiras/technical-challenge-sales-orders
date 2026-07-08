import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingState,
  type Column,
} from '@/shared/components/ui';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import { getErrorMessage } from '@/shared/lib/errors';
import type { SalesOrder } from '@/shared/types';
import { useCustomers } from '@/features/customers/queries';
import { useTransportTypes } from '@/features/transport-types/queries';
import { useSalesOrders } from '../queries';
import { calculateOrderTotal } from '../domain/rules';
import { StatusBadge } from './StatusBadge';

export function SalesOrdersPage() {
  const navigate = useNavigate();
  const ordersQuery = useSalesOrders();
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

  const columns: Column<SalesOrder>[] = [
    { header: 'Código', cell: (o) => <span className="font-medium text-slate-900">{o.code}</span> },
    { header: 'Cliente', cell: (o) => customerName(o.customerId) },
    { header: 'Transporte', cell: (o) => transportName(o.transportTypeId) },
    { header: 'Itens', align: 'right', cell: (o) => o.items.length },
    { header: 'Total', align: 'right', cell: (o) => formatCurrency(calculateOrderTotal(o.items)) },
    { header: 'Status', cell: (o) => <StatusBadge status={o.status} /> },
    { header: 'Criada em', cell: (o) => formatDate(o.createdAt) },
  ];

  return (
    <div>
      <PageHeader
        title="Ordens de Venda"
        description="Crie e acompanhe todo o ciclo de vida das ordens de venda."
        actions={
          <Button onClick={() => navigate({ to: '/sales-orders/new' })}>
            <Plus className="size-4" />
            Nova ordem
          </Button>
        }
      />

      <Card>
        {ordersQuery.isPending ? (
          <LoadingState label="Carregando ordens de venda..." />
        ) : ordersQuery.isError ? (
          <ErrorState message={getErrorMessage(ordersQuery.error)} />
        ) : ordersQuery.data.length === 0 ? (
          <EmptyState
            message="Nenhuma ordem de venda ainda."
            action={
              <Button onClick={() => navigate({ to: '/sales-orders/new' })}>
                <Plus className="size-4" />
                Nova ordem
              </Button>
            }
          />
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
