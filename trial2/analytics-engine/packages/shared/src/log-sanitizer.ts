/**
 * Keys whose values should be redacted in log output.
 * Matching is case-insensitive.
 */
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

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.includes(key.toLowerCase());
}

/**
 * Recursively sanitizes an object by redacting sensitive keys.
 * Handles deep nesting, arrays, and case-insensitive key matching.
 */
export function sanitizeLogContext(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogContext(item));
  }

  if (typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (isSensitiveKey(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeLogContext(val);
      }
    }
    return sanitized;
  }

  return value;
}
