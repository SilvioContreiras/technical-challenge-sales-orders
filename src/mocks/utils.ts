import { HttpResponse } from 'msw';
import type { ApiErrorBody } from '@/shared/api/client';

let idCounter = 0;

/** Generates a reasonably unique id for newly created mock entities. */
export function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

/** Current timestamp as an ISO string. */
export function now(): string {
  return new Date().toISOString();
}

/** Builds a JSON error response matching {@link ApiErrorBody}. */
export function errorResponse(status: number, message: string, code?: string, details?: unknown) {
  const body: ApiErrorBody = { message, code, details };
  return HttpResponse.json(body, { status });
}

/** 404 helper. */
export function notFound(message = 'Resource not found') {
  return errorResponse(404, message, 'NOT_FOUND');
}

/** 422 helper for business-rule / validation violations. */
export function unprocessable(message: string, code = 'UNPROCESSABLE', details?: unknown) {
  return errorResponse(422, message, code, details);
}
