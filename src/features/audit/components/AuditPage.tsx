import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import {
  Badge,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingState,
  type Column,
} from '@/shared/components/ui';
import { formatDateTime } from '@/shared/utils/format';
import { getErrorMessage } from '@/shared/lib/errors';
import type { AuditEvent, SalesOrderStatus } from '@/shared/types';
import { STATUS_LABELS } from '@/features/sales-orders/domain/status';
import { useAuditEvents } from '../queries';
import { AUDIT_ACTION_BADGE_CLASSES, AUDIT_ACTION_LABELS } from '../labels';

function formatAuditState(value: string | null): string {
  if (!value) return '—';
  if (value in STATUS_LABELS) return STATUS_LABELS[value as SalesOrderStatus];
  return value;
}

export function AuditPage() {
  const auditQuery = useAuditEvents();

  const columns: Column<AuditEvent>[] = [
    { header: 'Quando', cell: (e) => formatDateTime(e.timestamp) },
    {
      header: 'Ação',
      cell: (e) => (
        <Badge className={AUDIT_ACTION_BADGE_CLASSES[e.action]}>
          {AUDIT_ACTION_LABELS[e.action]}
        </Badge>
      ),
    },
    {
      header: 'Entidade',
      cell: (e) => <span className="font-medium text-slate-900">{e.entityLabel}</span>,
    },
    {
      header: 'Alteração',
      cell: (e) => (
        <span className="flex items-center gap-2 text-slate-600">
          <span>{formatAuditState(e.previousState)}</span>
          <ArrowRight className="size-3.5 text-slate-400" />
          <span className="font-medium text-slate-900">{formatAuditState(e.nextState)}</span>
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Trilha de Auditoria"
        description="Registro cronológico das alterações relevantes para rastreabilidade."
      />

      <Card>
        {auditQuery.isPending ? (
          <LoadingState label="Carregando eventos de auditoria..." />
        ) : auditQuery.isError ? (
          <ErrorState message={getErrorMessage(auditQuery.error)} />
        ) : auditQuery.data.length === 0 ? (
          <EmptyState message="Nenhum evento de auditoria registrado ainda." />
        ) : (
          <DataTable columns={columns} rows={auditQuery.data} rowKey={(e) => e.id} />
        )}
      </Card>
    </div>
  );
}
