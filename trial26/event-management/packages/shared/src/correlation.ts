// TRACED:EM-MON-004
import { randomUUID } from 'crypto';

/** Correlation ID header name for distributed tracing */
export const CORRELATION_ID_HEADER = 'x-correlation-id';

/** Generate a unique correlation ID for request tracing */
export function createCorrelationId(): string {
  return randomUUID();
}
