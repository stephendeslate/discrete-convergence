import { randomUUID } from 'crypto';

// TRACED:EM-MON-001 — Correlation ID generation for request tracing
export function createCorrelationId(): string {
  return randomUUID();
}
