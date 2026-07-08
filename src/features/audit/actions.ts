import { createAction } from '@reduxjs/toolkit';
import type { AuditEventPayload } from './api';

/**
 * Dispatched by feature mutations after a relevant change succeeds.
 * The audit saga (see `audit/saga.ts`) listens to this action and persists the
 * event, keeping audit logging fully decoupled from feature code.
 */
export const recordAuditEvent = createAction<AuditEventPayload>('audit/record');
