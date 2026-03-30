import { randomUUID } from 'crypto';

// TRACED: AE-MON-001
export function createCorrelationId(): string {
  return randomUUID();
}
