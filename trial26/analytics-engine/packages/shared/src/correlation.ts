import { randomUUID } from 'crypto';

export function getCorrelationId(headerValue?: string | null): string {
  if (headerValue && typeof headerValue === 'string' && headerValue.length > 0) {
    return headerValue;
  }
  return randomUUID();
}
