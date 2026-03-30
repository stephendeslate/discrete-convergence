// TRACED:FD-SHARED-002 — Correlation ID utilities
export const CORRELATION_ID_HEADER = 'x-correlation-id';

export function isValidCorrelationId(id: string): boolean {
  if (!id || id.length === 0 || id.length > 128) {
    return false;
  }
  return /^[a-zA-Z0-9-_]+$/.test(id);
}
