const DEFAULT_API_BASE_URL = '/api';

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  enableMocks: (import.meta.env.VITE_ENABLE_MOCKS ?? 'true') === 'true',
  isDev: import.meta.env.DEV,
} as const;
