import { apiClient } from '@/shared/api/client';
import type { Item } from '@/shared/types';

export type ItemPayload = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;

export async function fetchItems(q?: string): Promise<Item[]> {
  const { data } = await apiClient.get<Item[]>('/items', {
    params: q ? { q } : undefined,
  });
  return data;
}

export async function fetchItem(id: string): Promise<Item> {
  const { data } = await apiClient.get<Item>(`/items/${id}`);
  return data;
}

export async function createItem(payload: ItemPayload): Promise<Item> {
  const { data } = await apiClient.post<Item>('/items', payload);
  return data;
}
