import { http, HttpResponse } from 'msw';
import { env } from '@/app/config/env';
import type { AuditEvent } from '@/shared/types';
import { db } from '../db';
import { now, uid } from '../utils';

const base = `${env.apiBaseUrl}/audit-events`;

type AuditEventInput = Omit<AuditEvent, 'id' | 'timestamp'>;

export const auditHandlers = [
  http.get(base, ({ request }) => {
    const params = new URL(request.url).searchParams;
    const entityId = params.get('entityId');
    const action = params.get('action');

    let list = [...db.auditEvents];
    if (entityId) list = list.filter((e) => e.entityId === entityId);
    if (action) list = list.filter((e) => e.action === action);

    list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return HttpResponse.json(list);
  }),

  http.post(base, async ({ request }) => {
    const body = (await request.json()) as AuditEventInput;
    const event: AuditEvent = {
      id: uid('ae'),
      timestamp: now(),
      action: body.action,
      entity: body.entity,
      entityId: body.entityId,
      entityLabel: body.entityLabel,
      previousState: body.previousState ?? null,
      nextState: body.nextState ?? null,
    };
    db.auditEvents.push(event);
    return HttpResponse.json(event, { status: 201 });
  }),
];
