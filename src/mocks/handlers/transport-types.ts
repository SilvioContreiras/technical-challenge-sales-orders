import { http, HttpResponse } from 'msw';
import { env } from '@/app/config/env';
import type { TransportType } from '@/shared/types';
import { db } from '../db';
import { notFound, now, uid, unprocessable } from '../utils';

const base = `${env.apiBaseUrl}/transport-types`;

type TransportTypeInput = Omit<TransportType, 'id' | 'createdAt' | 'updatedAt'>;

export const transportTypeHandlers = [
  http.get(base, () => HttpResponse.json(db.transportTypes)),

  http.get(`${base}/:id`, ({ params }) => {
    const transportType = db.transportTypes.find((t) => t.id === params.id);
    if (!transportType) return notFound('Transport type not found');
    return HttpResponse.json(transportType);
  }),

  http.post(base, async ({ request }) => {
    const body = (await request.json()) as TransportTypeInput;
    const code = body.code.trim().toUpperCase();

    if (db.transportTypes.some((t) => t.code === code)) {
      return unprocessable('A transport type with this code already exists', 'DUPLICATE_CODE');
    }

    const timestamp = now();
    const transportType: TransportType = {
      id: uid('tt'),
      name: body.name,
      code,
      active: body.active ?? true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    db.transportTypes.push(transportType);
    return HttpResponse.json(transportType, { status: 201 });
  }),

  http.put(`${base}/:id`, async ({ params, request }) => {
    const transportType = db.transportTypes.find((t) => t.id === params.id);
    if (!transportType) return notFound('Transport type not found');

    const body = (await request.json()) as TransportTypeInput;
    const code = body.code.trim().toUpperCase();
    if (db.transportTypes.some((t) => t.code === code && t.id !== transportType.id)) {
      return unprocessable('A transport type with this code already exists', 'DUPLICATE_CODE');
    }

    Object.assign(transportType, {
      name: body.name,
      code,
      active: body.active,
      updatedAt: now(),
    });
    return HttpResponse.json(transportType);
  }),
];
