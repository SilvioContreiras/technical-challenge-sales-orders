import axios, { AxiosError } from 'axios';
import { env } from '@/app/config/env';

/**
 * Shared Axios instance. All feature services build on top of this so that
 * base URL, headers and error normalization live in a single place.
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Error shape returned by the mocked API (and expected from a real backend). */
export interface ApiErrorBody {
  message: string;
  code?: string;
  details?: unknown;
}

/** Normalized error thrown to the UI/query layer. */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.details = body.details;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response) {
      const { status, data } = error.response;
      throw new ApiError(status, data ?? { message: 'Erro inesperado' });
    }
    throw new ApiError(0, { message: error.message || 'Erro de rede' });
  },
);
