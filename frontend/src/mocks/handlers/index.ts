import { authHandlers } from './auth.ts';
import { eventHandlers } from './events.ts';
import { planHandlers } from './plans.ts';
import { consensusHandlers } from './consensus.ts';
import { chatHandlers } from './chat.ts';

export { authHandlers } from './auth.ts';
export { eventHandlers } from './events.ts';
export { planHandlers } from './plans.ts';
export { consensusHandlers } from './consensus.ts';
export { chatHandlers } from './chat.ts';

export const handlers = [
  ...authHandlers,
  ...eventHandlers,
  ...planHandlers,
  ...consensusHandlers,
  ...chatHandlers,
];
