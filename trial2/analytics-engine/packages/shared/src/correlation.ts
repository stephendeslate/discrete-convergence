import { randomUUID } from 'crypto';

/**
 * Creates a unique correlation ID for request tracing.
 * Used by CorrelationIdMiddleware to tag each request.
 */
export function createCorrelationId(): string {
  return randomUUID();
}
