import { env } from '@/app/config/env';

export async function enableMocking(): Promise<void> {
  if (!env.enableMocks) return;

  const { worker } = await import('./browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  });
}
