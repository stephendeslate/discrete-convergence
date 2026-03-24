// TRACED:FD-CORR-001
import { randomUUID } from 'node:crypto';

export function createCorrelationId(): string {
  return `fd-${randomUUID()}`;
}
