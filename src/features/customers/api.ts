import { apiClient } from '@/shared/api/client';
import type { Customer } from '@/shared/types';

export type CustomerPayload = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;

export async function fetchCustomers(q?: string): Promise<Customer[]> {
  const { data } = await apiClient.get<Customer[]>('/customers', {
    params: q ? { q } : undefined,
  });
  return data;
}

export async function fetchCustomer(id: string): Promise<Customer> {
  const { data } = await apiClient.get<Customer>(`/customers/${id}`);
  return data;
}

export async function createCustomer(payload: CustomerPayload): Promise<Customer> {
  const { data } = await apiClient.post<Customer>('/customers', payload);
  return data;
}

export async function updateCustomer(id: string, payload: CustomerPayload): Promise<Customer> {
  const { data } = await apiClient.put<Customer>(`/customers/${id}`, payload);
  return data;
}
