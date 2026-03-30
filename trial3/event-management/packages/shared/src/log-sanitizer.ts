const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'secret',
  'authorization',
];

const REDACTED = '[REDACTED]';

/**
 * Deep-sanitize an object by redacting sensitive fields.
 * Handles nested objects and arrays recursively.
 */
export function sanitizeLogContext(input: unknown): unknown {
  if (input === null || input === undefined) {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeLogContext(item));
  }

  if (typeof input === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
        result[key] = REDACTED;
      } else {
        result[key] = sanitizeLogContext(value);
      }
    }
    return result;
  }

  return input;
}
