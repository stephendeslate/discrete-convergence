// TRACED: EM-MON-001
import { randomUUID } from 'crypto';

/** Generate a correlation ID using randomUUID */
export function createCorrelationId(): string {
  return randomUUID();
}
