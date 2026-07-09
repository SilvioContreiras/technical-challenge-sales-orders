import { createAction } from '@reduxjs/toolkit';
import type { AuditEventPayload } from './api';

export const recordAuditEvent = createAction<AuditEventPayload>('audit/record');
