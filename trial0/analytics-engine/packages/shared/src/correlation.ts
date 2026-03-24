import { randomUUID } from 'crypto';

// TRACED:AE-CORR-001 — Creates unique correlation IDs for request tracing
export function createCorrelationId(): string {
  return randomUUID();
}
