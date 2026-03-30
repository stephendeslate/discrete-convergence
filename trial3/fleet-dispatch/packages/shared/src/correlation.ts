import { randomUUID } from 'crypto';

// TRACED:FD-MON-003
export function createCorrelationId(): string {
  return randomUUID();
}
