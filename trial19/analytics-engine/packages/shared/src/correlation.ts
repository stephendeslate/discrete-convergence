import { randomUUID } from 'crypto';

// TRACED: AE-MON-003
export function createCorrelationId(): string {
  return randomUUID();
}
