import { setupWorker } from 'msw/browser';
import { handlers } from './handlers/index.ts';

export const worker = setupWorker(...handlers);

export async function enableMocking() {
  if (import.meta.env.DEV || import.meta.env.VITE_USE_MOCK === 'true') {
    return worker.start({
      onUnhandledRequest: 'bypass',
    });
  }
}
