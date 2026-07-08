import { ApiError } from '@/shared/api/client';

/** Extracts a user-facing message from any thrown error. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Unexpected error';
}
