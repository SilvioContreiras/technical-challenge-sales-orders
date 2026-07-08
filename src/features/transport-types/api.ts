import { apiClient } from '@/shared/api/client';
import type { TransportType } from '@/shared/types';

export type TransportTypePayload = Omit<TransportType, 'id' | 'createdAt' | 'updatedAt'>;

export async function fetchTransportTypes(): Promise<TransportType[]> {
  const { data } = await apiClient.get<TransportType[]>('/transport-types');
  return data;
}

export async function fetchTransportType(id: string): Promise<TransportType> {
  const { data } = await apiClient.get<TransportType>(`/transport-types/${id}`);
  return data;
}

export async function createTransportType(payload: TransportTypePayload): Promise<TransportType> {
  const { data } = await apiClient.post<TransportType>('/transport-types', payload);
  return data;
}

export async function updateTransportType(
  id: string,
  payload: TransportTypePayload,
): Promise<TransportType> {
  const { data } = await apiClient.put<TransportType>(`/transport-types/${id}`, payload);
  return data;
}
