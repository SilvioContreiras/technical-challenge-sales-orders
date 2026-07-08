import { http, HttpResponse } from 'msw';
import { env } from '@/app/config/env';
import type { Customer } from '@/shared/types';
import { db } from '../db';
import { notFound, now, uid, unprocessable } from '../utils';

const base = `${env.apiBaseUrl}/customers`;

type CustomerInput = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;

export const customerHandlers = [
  http.get(base, ({ request }) => {
    const q = new URL(request.url).searchParams.get('q')?.toLowerCase();
    const list = q
      ? db.customers.filter((c) => c.name.toLowerCase().includes(q) || c.document.includes(q))
      : db.customers;
    return HttpResponse.json(list);
  }),

  http.get(`${base}/:id`, ({ params }) => {
    const customer = db.customers.find((c) => c.id === params.id);
    if (!customer) return notFound('Cliente não encontrado');
    return HttpResponse.json(customer);
  }),

  http.post(base, async ({ request }) => {
    const body = (await request.json()) as CustomerInput;

    if (db.customers.some((c) => c.document === body.document)) {
      return unprocessable('Já existe um cliente com este documento', 'DUPLICATE_DOCUMENT');
    }

    const timestamp = now();
    const customer: Customer = {
      id: uid('cust'),
      name: body.name,
      document: body.document,
      email: body.email,
      active: body.active ?? true,
      authorizedTransportTypeIds: body.authorizedTransportTypeIds ?? [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    db.customers.push(customer);
    return HttpResponse.json(customer, { status: 201 });
  }),

  http.put(`${base}/:id`, async ({ params, request }) => {
    const customer = db.customers.find((c) => c.id === params.id);
    if (!customer) return notFound('Cliente não encontrado');

    const body = (await request.json()) as CustomerInput;
    if (db.customers.some((c) => c.document === body.document && c.id !== customer.id)) {
      return unprocessable('Já existe um cliente com este documento', 'DUPLICATE_DOCUMENT');
    }

    Object.assign(customer, {
      name: body.name,
      document: body.document,
      email: body.email,
      active: body.active,
      authorizedTransportTypeIds: body.authorizedTransportTypeIds ?? [],
      updatedAt: now(),
    });
    return HttpResponse.json(customer);
  }),
];
