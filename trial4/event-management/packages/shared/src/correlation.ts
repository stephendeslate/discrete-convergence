import { v4 as uuidv4 } from 'uuid';

// TRACED:EM-MON-001 — correlation ID generator used by CorrelationIdMiddleware
export function createCorrelationId(): string {
  return uuidv4();
}
