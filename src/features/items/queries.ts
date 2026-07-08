import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryKeys';
import { useAppDispatch } from '@/app/store/hooks';
import { notify } from '@/app/store/notificationsSlice';
import { getErrorMessage } from '@/shared/lib/errors';
import { createItem, fetchItem, fetchItems, type ItemPayload } from './api';

export function useItems(q?: string) {
  return useQuery({
    queryKey: queryKeys.items.list(q),
    queryFn: () => fetchItems(q),
  });
}

export function useItem(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.items.detail(id),
    queryFn: () => fetchItem(id),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (payload: ItemPayload) => createItem(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.items.all });
      dispatch(notify({ variant: 'success', message: 'Item criado com sucesso' }));
    },
    onError: (error) => dispatch(notify({ variant: 'error', message: getErrorMessage(error) })),
  });
}
