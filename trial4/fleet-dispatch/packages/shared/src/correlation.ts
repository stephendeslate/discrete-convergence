import { randomUUID } from 'crypto';

/** Create a unique correlation ID for request tracing */
export function createCorrelationId(): string {
  return randomUUID();
}
