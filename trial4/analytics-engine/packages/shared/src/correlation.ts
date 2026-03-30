import { randomUUID } from 'crypto';

/** Generate a unique correlation ID for request tracing */
export function createCorrelationId(): string {
  return randomUUID();
}
