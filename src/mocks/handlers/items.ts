import { http, HttpResponse } from 'msw';
import { env } from '@/app/config/env';
import type { Item } from '@/shared/types';
import { db } from '../db';
import { notFound, now, uid, unprocessable } from '../utils';

const base = `${env.apiBaseUrl}/items`;

type ItemInput = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;

export const itemHandlers = [
  http.get(base, ({ request }) => {
    const q = new URL(request.url).searchParams.get('q')?.toLowerCase();
    const list = q
      ? db.items.filter((i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
      : db.items;
    return HttpResponse.json(list);
  }),

  http.get(`${base}/:id`, ({ params }) => {
    const item = db.items.find((i) => i.id === params.id);
    if (!item) return notFound('Item not found');
    return HttpResponse.json(item);
  }),

  http.post(base, async ({ request }) => {
    const body = (await request.json()) as ItemInput;
    const sku = body.sku.trim().toUpperCase();

    if (db.items.some((i) => i.sku === sku)) {
      return unprocessable('An item with this SKU already exists', 'DUPLICATE_SKU');
    }

    const timestamp = now();
    const item: Item = {
      id: uid('item'),
      sku,
      name: body.name,
      description: body.description,
      unitOfMeasure: body.unitOfMeasure,
      unitPrice: body.unitPrice,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    db.items.push(item);
    return HttpResponse.json(item, { status: 201 });
  }),
];
