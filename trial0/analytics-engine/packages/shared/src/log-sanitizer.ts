// TRACED:AE-SAN-001 — Sanitizes log context to redact sensitive fields
const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'secret',
  'authorization',
] as const;

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.includes(key.toLowerCase() as typeof SENSITIVE_KEYS[number]);
}

// TRACED:AE-SAN-002 — Deep nested sanitization with array recursion
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
      if (isSensitiveKey(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeLogContext(value);
      }
    }
    return sanitized;
  }

  return obj;
}
