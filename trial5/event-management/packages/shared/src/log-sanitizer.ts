// TRACED:EM-MON-003 — Log sanitizer redacts sensitive fields
const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'secret',
  'authorization',
];

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.includes(key.toLowerCase());
}

// TRACED:EM-MON-004 — sanitizeLogContext handles nested objects and arrays recursively
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
      if (isSensitiveKey(key)) {
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        result[key] = sanitizeLogContext(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  return obj;
}
