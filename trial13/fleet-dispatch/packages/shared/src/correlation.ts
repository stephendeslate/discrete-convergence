import { randomUUID } from 'crypto';

// TRACED: FD-MON-001
export function createCorrelationId(): string {
  return randomUUID();
}
