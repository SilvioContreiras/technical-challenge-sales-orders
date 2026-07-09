import { HttpResponse } from 'msw';
import type { ApiErrorBody } from '@/shared/api/client';

let idCounter = 0;

export function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function now(): string {
  return new Date().toISOString();
}

export function errorResponse(status: number, message: string, code?: string, details?: unknown) {
  const body: ApiErrorBody = { message, code, details };
  return HttpResponse.json(body, { status });
}

export function notFound(message = 'Recurso não encontrado') {
  return errorResponse(404, message, 'NOT_FOUND');
}

export function unprocessable(message: string, code = 'UNPROCESSABLE', details?: unknown) {
  return errorResponse(422, message, code, details);
}
