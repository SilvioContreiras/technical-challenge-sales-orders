import { env } from '@/app/config/env';

/** No-ops when mocks disabled so the same entrypoint works against a real API. */
export async function enableMocking(): Promise<void> {
  if (!env.enableMocks) return;

  const { worker } = await import('./browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  });
}
