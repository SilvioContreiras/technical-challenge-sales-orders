import { http, HttpResponse } from 'msw';
import { env } from '@/app/config/env';

/**
 * Request handlers for the mocked REST API.
 * Feature handlers are appended here as the domain is implemented.
 */
export const handlers = [
  http.get(`${env.apiBaseUrl}/health`, () => {
    return HttpResponse.json({ status: 'ok' });
  }),
];
