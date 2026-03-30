import { randomUUID } from 'crypto';

// TRACED: EM-MON-002
export function createCorrelationId(): string {
  return randomUUID();
}
