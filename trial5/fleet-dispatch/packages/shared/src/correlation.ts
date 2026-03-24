import { randomUUID } from 'crypto';

// TRACED:FD-MON-002 — correlation ID generation for request tracing
export function createCorrelationId(): string {
  return randomUUID();
}
