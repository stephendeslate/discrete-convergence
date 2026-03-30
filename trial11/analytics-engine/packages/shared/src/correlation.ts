import { randomUUID } from 'crypto';

// TRACED: AE-MON-002
export function createCorrelationId(): string {
  return randomUUID();
}
