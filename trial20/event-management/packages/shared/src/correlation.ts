import { randomUUID } from 'crypto';

// TRACED: EM-MON-001
export function createCorrelationId(): string {
  return randomUUID();
}
