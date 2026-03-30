const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'secret',
  'authorization',
  'refreshtoken',
  'apikey',
  'configencrypted',
];

const REDACTED = '[REDACTED]';

/**
 * Recursively sanitizes an object by redacting sensitive fields.
 * Handles nested objects and arrays. Case-insensitive key matching.
 */
export function sanitizeLogContext(input: unknown): unknown {
  if (input === null || input === undefined) {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeLogContext(item));
  }

  if (typeof input === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
        sanitized[key] = REDACTED;
      } else {
        sanitized[key] = sanitizeLogContext(value);
      }
    }
    return sanitized;
  }

  return input;
}
