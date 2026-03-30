import { randomUUID } from 'crypto';

/**
 * Creates a unique correlation ID for request tracing.
 * If a client-provided ID exists, it is preserved; otherwise a new UUID is generated.
 */
export function createCorrelationId(existing?: string): string {
  if (existing && existing.length > 0 && existing.length <= 128) {
    return existing;
  }
  return randomUUID();
}
