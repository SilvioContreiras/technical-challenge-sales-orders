import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryKeys';
import { fetchAuditEvents } from './api';

export function useAuditEvents(entityId?: string) {
  return useQuery({
    queryKey: queryKeys.audit.list(entityId),
    queryFn: () => fetchAuditEvents(entityId),
  });
}
