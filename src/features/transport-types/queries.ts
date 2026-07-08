import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryKeys';
import { useAppDispatch } from '@/app/store/hooks';
import { notify } from '@/app/store/notificationsSlice';
import { getErrorMessage } from '@/shared/lib/errors';
import {
  createTransportType,
  fetchTransportType,
  fetchTransportTypes,
  updateTransportType,
  type TransportTypePayload,
} from './api';

export function useTransportTypes() {
  return useQuery({
    queryKey: queryKeys.transportTypes.list(),
    queryFn: fetchTransportTypes,
  });
}

export function useTransportType(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.transportTypes.detail(id),
    queryFn: () => fetchTransportType(id),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateTransportType() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (payload: TransportTypePayload) => createTransportType(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transportTypes.all });
      dispatch(notify({ variant: 'success', message: 'Tipo de transporte criado com sucesso' }));
    },
    onError: (error) => dispatch(notify({ variant: 'error', message: getErrorMessage(error) })),
  });
}

export function useUpdateTransportType() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TransportTypePayload }) =>
      updateTransportType(id, payload),
    onSuccess: (transportType) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transportTypes.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.transportTypes.detail(transportType.id),
      });
      dispatch(
        notify({ variant: 'success', message: 'Tipo de transporte atualizado com sucesso' }),
      );
    },
    onError: (error) => dispatch(notify({ variant: 'error', message: getErrorMessage(error) })),
  });
}
