import { randomUUID } from 'crypto';

/** Creates a unique correlation ID for request tracing */
export function createCorrelationId(): string {
  return randomUUID();
}
