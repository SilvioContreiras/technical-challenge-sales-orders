import { http, HttpResponse } from 'msw';
import { env } from '@/app/config/env';
import { customerHandlers } from './customers';
import { transportTypeHandlers } from './transport-types';
import { itemHandlers } from './items';
import { salesOrderHandlers } from './sales-orders';
import { auditHandlers } from './audit';

export const handlers = [
  http.get(`${env.apiBaseUrl}/health`, () => HttpResponse.json({ status: 'ok' })),
  ...customerHandlers,
  ...transportTypeHandlers,
  ...itemHandlers,
  ...salesOrderHandlers,
  ...auditHandlers,
];
