// TRACED:EM-SAN-001 — Sanitizes log context to redact sensitive fields
const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'cookie', 'creditcard'];

function isSensitive(key: string): boolean {
  return SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s));
}

// TRACED:EM-SAN-002 — Deep nested sanitization with array recursion
export function sanitizeLogContext(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeLogContext(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (isSensitive(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogContext(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
