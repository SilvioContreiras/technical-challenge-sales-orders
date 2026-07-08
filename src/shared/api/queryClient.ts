import { QueryClient } from '@tanstack/react-query';

/**
 * Factory so tests can spin up an isolated client with retries disabled while
 * the app uses a single shared instance.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export const queryClient = createQueryClient();
