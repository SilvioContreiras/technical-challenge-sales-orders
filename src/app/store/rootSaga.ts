import { all, fork } from 'redux-saga/effects';

/**
 * Root saga. Feature sagas (e.g. the audit trail) are registered here so that
 * global side effects live in one predictable place.
 */
export function* rootSaga() {
  yield all([
    // audit saga is registered in a later stage
    ...([] as ReturnType<typeof fork>[]),
  ]);
}
