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
import {
  hasConfirmedSchedule,
  transitionRequiresConfirmedSchedule,
} from '@/features/sales-orders/domain/schedule';
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
    if (!item) return { error: `O item ${line.itemId} não existe` };
    if (line.quantity <= 0) return { error: `A quantidade de ${item.sku} deve ser maior que zero` };
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
    if (!order) return notFound('Ordem de venda não encontrada');
    return HttpResponse.json(order);
  }),

  http.post(base, async ({ request }) => {
    const body = (await request.json()) as CreateSalesOrderInput;

    const customer = db.customers.find((c) => c.id === body.customerId);
    if (!customer) return unprocessable('Cliente não encontrado', 'CUSTOMER_NOT_FOUND');
    if (!customer.active) return unprocessable('O cliente está inativo', 'CUSTOMER_INACTIVE');

    const transportType = db.transportTypes.find((t) => t.id === body.transportTypeId);
    if (!transportType)
      return unprocessable('Tipo de transporte não encontrado', 'TRANSPORT_NOT_FOUND');

    if (!isTransportAuthorizedForCustomer(customer, body.transportTypeId)) {
      return unprocessable(
        'O tipo de transporte não está autorizado para o cliente selecionado',
        'TRANSPORT_NOT_AUTHORIZED',
      );
    }

    if (!hasAtLeastOneItem(body.items ?? [])) {
      return unprocessable('A ordem deve conter pelo menos um item', 'NO_ITEMS');
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
    if (!order) return notFound('Ordem de venda não encontrada');

    const { status } = (await request.json()) as { status: SalesOrderStatus };

    if (!canTransition(order.status, status)) {
      return unprocessable(
        `Transição de status inválida: ${order.status} -> ${status}`,
        'INVALID_TRANSITION',
      );
    }
    if (
      transitionRequiresConfirmedSchedule(order.status, status) &&
      !hasConfirmedSchedule(order.schedule)
    ) {
      return unprocessable('A ordem requer um agendamento confirmado', 'SCHEDULE_REQUIRED');
    }

    order.status = status;
    order.updatedAt = now();
    return HttpResponse.json(order);
  }),

  http.put(`${base}/:id/schedule`, async ({ params, request }) => {
    const order = db.salesOrders.find((o) => o.id === params.id);
    if (!order) return notFound('Ordem de venda não encontrada');

    if (order.status !== 'PLANNED' && order.status !== 'SCHEDULED') {
      return unprocessable(
        'A ordem deve estar planejada antes do agendamento',
        'INVALID_STATUS_FOR_SCHEDULE',
      );
    }

    const body = (await request.json()) as { deliveryDate: string; window: ServiceWindow };
    if (!body.deliveryDate) {
      return unprocessable('A data de entrega é obrigatória', 'DELIVERY_DATE_REQUIRED');
    }

    // Unconfirmed schedule cannot remain on SCHEDULED — demote so dispatch stays blocked.
    if (order.status === 'SCHEDULED') {
      order.status = 'PLANNED';
    }

    order.schedule = { deliveryDate: body.deliveryDate, window: body.window, confirmed: false };
    order.updatedAt = now();
    return HttpResponse.json(order);
  }),

  http.post(`${base}/:id/schedule/confirm`, ({ params }) => {
    const order = db.salesOrders.find((o) => o.id === params.id);
    if (!order) return notFound('Ordem de venda não encontrada');
    if (!order.schedule) return unprocessable('Não há agendamento para confirmar', 'NO_SCHEDULE');

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
      return unprocessable('A ordem não pode ser agendada no status atual', 'INVALID_STATUS');
    }

    order.schedule = { ...order.schedule, confirmed: true };
    order.updatedAt = now();
    return HttpResponse.json(order);
  }),

  http.put(`${base}/:id/transport`, async ({ params, request }) => {
    const order = db.salesOrders.find((o) => o.id === params.id);
    if (!order) return notFound('Ordem de venda não encontrada');
    if (order.status === 'IN_TRANSIT' || order.status === 'DELIVERED') {
      return unprocessable(
        'O transporte não pode ser alterado após o despacho',
        'TRANSPORT_LOCKED',
      );
    }

    const { transportTypeId } = (await request.json()) as { transportTypeId: string };
    const customer = db.customers.find((c) => c.id === order.customerId);
    const transportType = db.transportTypes.find((t) => t.id === transportTypeId);
    if (!customer) return unprocessable('Cliente não encontrado', 'CUSTOMER_NOT_FOUND');
    if (!transportType)
      return unprocessable('Tipo de transporte não encontrado', 'TRANSPORT_NOT_FOUND');

    if (!isTransportAuthorizedForCustomer(customer, transportTypeId)) {
      return unprocessable(
        'O tipo de transporte não está autorizado para o cliente selecionado',
        'TRANSPORT_NOT_AUTHORIZED',
      );
    }

    order.transportTypeId = transportTypeId;
    order.updatedAt = now();
    return HttpResponse.json(order);
  }),
];
