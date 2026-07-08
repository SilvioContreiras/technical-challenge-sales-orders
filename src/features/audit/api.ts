import { apiClient } from '@/shared/api/client';
import type { AuditEvent } from '@/shared/types';

export type AuditEventPayload = Omit<AuditEvent, 'id' | 'timestamp'>;

export async function fetchAuditEvents(entityId?: string): Promise<AuditEvent[]> {
  const { data } = await apiClient.get<AuditEvent[]>('/audit-events', {
    params: entityId ? { entityId } : undefined,
  });
  return data;
}

export async function createAuditEvent(payload: AuditEventPayload): Promise<AuditEvent> {
  const { data } = await apiClient.post<AuditEvent>('/audit-events', payload);
  return data;
}
