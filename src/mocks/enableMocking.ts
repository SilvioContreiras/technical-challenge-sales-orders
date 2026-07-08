import { env } from '@/app/config/env';

/**
 * Starts the Mock Service Worker before the app renders.
 * No-ops when mocking is disabled so the same entrypoint works against a real API.
 */
export async function enableMocking(): Promise<void> {
  if (!env.enableMocks) return;

  const { worker } = await import('./browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  });
}
