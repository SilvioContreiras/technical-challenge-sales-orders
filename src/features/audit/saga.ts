import { call, put, takeEvery } from 'redux-saga/effects';
import { queryClient } from '@/shared/api/queryClient';
import { queryKeys } from '@/shared/api/queryKeys';
import { notify } from '@/app/store/notificationsSlice';
import { recordAuditEvent } from './actions';
import { createAuditEvent } from './api';

function* handleRecordAuditEvent(action: ReturnType<typeof recordAuditEvent>) {
  try {
    yield call(createAuditEvent, action.payload);
    yield call([queryClient, 'invalidateQueries'], { queryKey: queryKeys.audit.all });
  } catch {
    yield put(notify({ variant: 'error', message: 'Falha ao registrar evento de auditoria' }));
  }
}

export function* auditSaga() {
  yield takeEvery(recordAuditEvent.type, handleRecordAuditEvent);
}
