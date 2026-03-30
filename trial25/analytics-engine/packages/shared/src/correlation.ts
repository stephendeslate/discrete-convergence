// TRACED:SHARED-CORR — Correlation ID utilities
import { randomUUID } from 'crypto';

// TRACED:AE-CORR-001 — Correlation ID generation
export function createCorrelationId(): string {
  return randomUUID();
}
