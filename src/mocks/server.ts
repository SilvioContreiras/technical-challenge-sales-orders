import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** MSW server used by the test environment (Node). */
export const server = setupServer(...handlers);
