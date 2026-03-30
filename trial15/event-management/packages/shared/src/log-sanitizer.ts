// TRACED: EM-MON-004
import { SENSITIVE_KEYS } from './constants';

/**
 * Recursively redact sensitive fields from objects for safe logging.
 * Case-insensitive key matching. Handles nested objects and arrays.
 */
export function sanitizeLogContext(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeLogContext(item));
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.includes(key.toLowerCase() as typeof SENSITIVE_KEYS[number])) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = sanitizeLogContext(value);
      }
    }
    return result;
  }

  return obj;
}
