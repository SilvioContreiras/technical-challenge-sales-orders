/**
 * Centralized, typed access to runtime configuration.
 * Keeping this in a single module makes it trivial to swap the mocked API for a
 * real backend later — only this file and the MSW bootstrap need to change.
 */

const DEFAULT_API_BASE_URL = '/api';

export const env = {
  /** Base URL used by the Axios client. Defaults to the MSW-intercepted `/api`. */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  /** Enables the Mock Service Worker. Enabled by default in development. */
  enableMocks: (import.meta.env.VITE_ENABLE_MOCKS ?? 'true') === 'true',
  isDev: import.meta.env.DEV,
} as const;
