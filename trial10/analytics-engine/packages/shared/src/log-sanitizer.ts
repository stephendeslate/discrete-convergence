/** Keys that should be redacted from log output (case-insensitive) */
const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'access_token',
  'secret',
  'authorization',
];

/**
 * Sanitizes a log context object by redacting sensitive fields.
 * Handles nested objects and arrays recursively.
 * Case-insensitive key matching.
 */
export function sanitizeLogContext(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeLogContext(item));
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeLogContext(value);
      }
    }
    return sanitized;
  }

  return obj;
}
