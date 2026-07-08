import { Badge } from '@/shared/components/ui';
import type { SalesOrderStatus } from '@/shared/types';
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from '../domain/status';

export function StatusBadge({ status }: { status: SalesOrderStatus }) {
  return <Badge className={STATUS_BADGE_CLASSES[status]}>{STATUS_LABELS[status]}</Badge>;
}
