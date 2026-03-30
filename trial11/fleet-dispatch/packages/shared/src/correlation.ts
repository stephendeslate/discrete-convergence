import { randomUUID } from 'crypto';

// TRACED: FD-MON-002
export function createCorrelationId(): string {
  return randomUUID();
}
