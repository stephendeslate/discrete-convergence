// TRACED:EM-CORR-001 — Creates unique correlation IDs for request tracing
import { randomUUID } from 'crypto';

export function createCorrelationId(): string {
  return randomUUID();
}
