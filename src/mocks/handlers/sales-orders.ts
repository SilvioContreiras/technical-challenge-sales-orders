import { http, HttpResponse } from 'msw';
import { env } from '@/app/config/env';
import type { SalesOrder, SalesOrderItem, SalesOrderStatus, ServiceWindow } from '@/shared/types';
import {
  canTransition,
  InvalidTransitionError,
  assertTransition,
} from '@/features/sales-orders/domain/state-machine';
import {
  hasAtLeastOneItem,
  isTransportAuthorizedForCustomer,
} from '@/features/sales-orders/domain/rules';
import { db } from '../db';
import { notFound, now, uid, unprocessable } from '../utils';

const base = `${env.apiBaseUrl}/sales-orders`;

interface CreateSalesOrderInput {
  customerId: string;
  transportTypeId: string;
  items: { itemId: string; quantity: number }[];
}

function nextOrderCode(): string {
  db.orderSequence += 1;
  return `SO-${String(db.orderSequence).padStart(4, '0')}`;
}

function buildLineItems(
  input: CreateSalesOrderInput['items'],
): SalesOrderItem[] | { error: string } {
  const lines: SalesOrderItem[] = [];
  for (const line of input) {
    const item = db.items.find((i) => i.id === line.itemId);
    if (!item) return { error: `Item ${line.itemId} does not exist` };
    if (line.quantity <= 0) return { error: `Quantity for ${item.sku} must be greater than zero` };
    lines.push({
      itemId: item.id,
      sku: item.sku,
      name: item.name,
      quantity: line.quantity,
      unitPrice: item.unitPrice,
    });
  }
  return lines;
}

export const salesOrderHandlers = [
  http.get(base, ({ request }) => {
    const params = new URL(request.url).searchParams;
    const status = params.get('status');
    const customerId = params.get('customerId');
    const transportTypeId = params.get('transportTypeId');
    const dateFrom = params.get('dateFrom');
    const dateTo = params.get('dateTo');

    let list = [...db.salesOrders];
    if (status) list = list.filter((o) => o.status === status);
    if (customerId) list = list.filter((o) => o.customerId === customerId);
    if (transportTypeId) list = list.filter((o) => o.transportTypeId === transportTypeId);
    if (dateFrom) list = list.filter((o) => o.createdAt.slice(0, 10) >= dateFrom);
    if (dateTo) list = list.filter((o) => o.createdAt.slice(0, 10) <= dateTo);

    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return HttpResponse.json(list);
  }),

  http.get(`${base}/:id`, ({ params }) => {
    const order = db.salesOrders.find((o) => o.id === params.id);
    if (!order) return notFound('Sales order not found');
    return HttpResponse.json(order);
  }),

  http.post(base, async ({ request }) => {
    const body = (await request.json()) as CreateSalesOrderInput;

    const customer = db.customers.find((c) => c.id === body.customerId);
    if (!customer) return unprocessable('Customer not found', 'CUSTOMER_NOT_FOUND');
    if (!customer.active) return unprocessable('Customer is inactive', 'CUSTOMER_INACTIVE');

    const transportType = db.transportTypes.find((t) => t.id === body.transportTypeId);
    if (!transportType) return unprocessable('Transport type not found', 'TRANSPORT_NOT_FOUND');

    if (!isTransportAuthorizedForCustomer(customer, body.transportTypeId)) {
      return unprocessable(
        'Transport type is not authorized for the selected customer',
        'TRANSPORT_NOT_AUTHORIZED',
      );
    }

    if (!hasAtLeastOneItem(body.items ?? [])) {
      return unprocessable('Order must contain at least one item', 'NO_ITEMS');
    }

    const lines = buildLineItems(body.items);
    if ('error' in lines) return unprocessable(lines.error, 'INVALID_ITEM');

    const timestamp = now();
    const order: SalesOrder = {
      id: uid('so'),
      code: nextOrderCode(),
      customerId: body.customerId,
      transportTypeId: body.transportTypeId,
      items: lines,
      status: 'CREATED',
      schedule: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    db.salesOrders.push(order);
    return HttpResponse.json(order, { status: 201 });
  }),

  http.patch(`${base}/:id/status`, async ({ params, request }) => {
    const order = db.salesOrders.find((o) => o.id === params.id);
    if (!order) return notFound('Sales order not found');

    const { status } = (await request.json()) as { status: SalesOrderStatus };

    if (!canTransition(order.status, status)) {
      return unprocessable(
        `Invalid status transition: ${order.status} -> ${status}`,
        'INVALID_TRANSITION',
      );
    }
    if (status === 'SCHEDULED' && !order.schedule?.confirmed) {
      return unprocessable('Order requires a confirmed schedule', 'SCHEDULE_REQUIRED');
    }

    order.status = status;
    order.updatedAt = now();
    return HttpResponse.json(order);
  }),

  http.put(`${base}/:id/schedule`, async ({ params, request }) => {
    const order = db.salesOrders.find((o) => o.id === params.id);
    if (!order) return notFound('Sales order not found');

    if (order.status !== 'PLANNED' && order.status !== 'SCHEDULED') {
      return unprocessable(
        'Order must be planned before scheduling',
        'INVALID_STATUS_FOR_SCHEDULE',
      );
    }

    const body = (await request.json()) as { deliveryDate: string; window: ServiceWindow };
    if (!body.deliveryDate) {
      return unprocessable('Delivery date is required', 'DELIVERY_DATE_REQUIRED');
    }

    order.schedule = { deliveryDate: body.deliveryDate, window: body.window, confirmed: false };
    order.updatedAt = now();
    return HttpResponse.json(order);
  }),

  http.post(`${base}/:id/schedule/confirm`, ({ params }) => {
    const order = db.salesOrders.find((o) => o.id === params.id);
    if (!order) return notFound('Sales order not found');
    if (!order.schedule) return unprocessable('There is no schedule to confirm', 'NO_SCHEDULE');

    if (order.status === 'PLANNED') {
      try {
        assertTransition(order.status, 'SCHEDULED');
      } catch (error) {
        if (error instanceof InvalidTransitionError) {
          return unprocessable(error.message, 'INVALID_TRANSITION');
        }
        throw error;
      }
      order.status = 'SCHEDULED';
    } else if (order.status !== 'SCHEDULED') {
      return unprocessable('Order cannot be scheduled in its current status', 'INVALID_STATUS');
    }

    order.schedule = { ...order.schedule, confirmed: true };
    order.updatedAt = now();
    return HttpResponse.json(order);
  }),

  http.put(`${base}/:id/transport`, async ({ params, request }) => {
    const order = db.salesOrders.find((o) => o.id === params.id);
    if (!order) return notFound('Sales order not found');
    if (order.status === 'IN_TRANSIT' || order.status === 'DELIVERED') {
      return unprocessable('Transport cannot be changed after dispatch', 'TRANSPORT_LOCKED');
    }

    const { transportTypeId } = (await request.json()) as { transportTypeId: string };
    const customer = db.customers.find((c) => c.id === order.customerId);
    const transportType = db.transportTypes.find((t) => t.id === transportTypeId);
    if (!customer) return unprocessable('Customer not found', 'CUSTOMER_NOT_FOUND');
    if (!transportType) return unprocessable('Transport type not found', 'TRANSPORT_NOT_FOUND');

    if (!isTransportAuthorizedForCustomer(customer, transportTypeId)) {
      return unprocessable(
        'Transport type is not authorized for the selected customer',
        'TRANSPORT_NOT_AUTHORIZED',
      );
    }

    order.transportTypeId = transportTypeId;
    order.updatedAt = now();
    return HttpResponse.json(order);
  }),
];
