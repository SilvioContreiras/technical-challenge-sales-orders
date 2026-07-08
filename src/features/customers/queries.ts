import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryKeys';
import { useAppDispatch } from '@/app/store/hooks';
import { notify } from '@/app/store/notificationsSlice';
import { getErrorMessage } from '@/shared/lib/errors';
import {
  createCustomer,
  fetchCustomer,
  fetchCustomers,
  updateCustomer,
  type CustomerPayload,
} from './api';

export function useCustomers(q?: string) {
  return useQuery({
    queryKey: queryKeys.customers.list(q),
    queryFn: () => fetchCustomers(q),
  });
}

export function useCustomer(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => fetchCustomer(id),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (payload: CustomerPayload) => createCustomer(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      dispatch(notify({ variant: 'success', message: 'Cliente criado com sucesso' }));
    },
    onError: (error) => dispatch(notify({ variant: 'error', message: getErrorMessage(error) })),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CustomerPayload }) =>
      updateCustomer(id, payload),
    onSuccess: (customer) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(customer.id) });
      dispatch(notify({ variant: 'success', message: 'Cliente atualizado com sucesso' }));
    },
    onError: (error) => dispatch(notify({ variant: 'error', message: getErrorMessage(error) })),
  });
}
