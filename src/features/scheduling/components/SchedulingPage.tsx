import { useMemo, useState } from 'react';
import { CalendarClock, CalendarPlus } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingState,
  type Column,
} from '@/shared/components/ui';
import { formatDate } from '@/shared/utils/format';
import { getErrorMessage } from '@/shared/lib/errors';
import type { SalesOrder } from '@/shared/types';
import { useCustomers } from '@/features/customers/queries';
import { useSalesOrders } from '@/features/sales-orders/queries';
import { StatusBadge } from '@/features/sales-orders/components/StatusBadge';
import { WINDOW_LABELS } from '@/features/sales-orders/domain/schedule';
import { SchedulingModal } from './SchedulingModal';

export function SchedulingPage() {
  const ordersQuery = useSalesOrders();
  const customersQuery = useCustomers();
  const [selected, setSelected] = useState<SalesOrder | null>(null);
  const [open, setOpen] = useState(false);

  const customerName = useMemo(() => {
    const map = new Map((customersQuery.data ?? []).map((c) => [c.id, c.name]));
    return (id: string) => map.get(id) ?? '—';
  }, [customersQuery.data]);

  const schedulable = (ordersQuery.data ?? []).filter(
    (order) => order.status === 'PLANNED' || order.status === 'SCHEDULED',
  );

  function openModal(order: SalesOrder) {
    setSelected(order);
    setOpen(true);
  }

  const columns: Column<SalesOrder>[] = [
    { header: 'Código', cell: (o) => <span className="font-medium text-slate-900">{o.code}</span> },
    { header: 'Cliente', cell: (o) => customerName(o.customerId) },
    {
      header: 'Data de entrega',
      cell: (o) => (o.schedule ? formatDate(o.schedule.deliveryDate) : '—'),
    },
    {
      header: 'Janela',
      cell: (o) => (o.schedule ? WINDOW_LABELS[o.schedule.window] : '—'),
    },
    { header: 'Status', cell: (o) => <StatusBadge status={o.status} /> },
    {
      header: 'Agendamento',
      cell: (o) =>
        o.schedule?.confirmed ? (
          <Badge className="bg-emerald-100 text-emerald-700">Confirmado</Badge>
        ) : o.schedule ? (
          <Badge className="bg-amber-100 text-amber-700">Pendente</Badge>
        ) : (
          <Badge className="bg-slate-100 text-slate-500">Não agendado</Badge>
        ),
    },
    {
      header: '',
      align: 'right',
      cell: (o) => (
        <Button variant="ghost" size="sm" onClick={() => openModal(o)}>
          {o.schedule ? (
            <>
              <CalendarClock className="size-4" />
              Reagendar
            </>
          ) : (
            <>
              <CalendarPlus className="size-4" />
              Agendar
            </>
          )}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Central de Agendamento"
        description="Defina datas de entrega e janelas de atendimento para ordens planejadas."
      />

      <Card>
        {ordersQuery.isPending ? (
          <LoadingState label="Carregando ordens..." />
        ) : ordersQuery.isError ? (
          <ErrorState message={getErrorMessage(ordersQuery.error)} />
        ) : schedulable.length === 0 ? (
          <EmptyState message="Nenhuma ordem aguardando agendamento. Planeje uma ordem primeiro." />
        ) : (
          <DataTable columns={columns} rows={schedulable} rowKey={(o) => o.id} />
        )}
      </Card>

      <SchedulingModal
        key={selected?.id ?? 'none'}
        open={open}
        onClose={() => setOpen(false)}
        order={selected}
      />
    </div>
  );
}
