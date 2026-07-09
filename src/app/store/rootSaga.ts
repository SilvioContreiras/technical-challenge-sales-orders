import { all, fork } from 'redux-saga/effects';
import { auditSaga } from '@/features/audit/saga';

export function* rootSaga() {
  yield all([fork(auditSaga)]);
}
