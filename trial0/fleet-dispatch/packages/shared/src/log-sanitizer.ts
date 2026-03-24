// TRACED:FD-SAN-001
// TRACED:FD-SAN-002
const SENSITIVE_KEYS = /^(password|secret|token|authorization|cookie|credit.?card|ssn|api.?key)$/i;

export function sanitizeLogContext(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogContext(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.test(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = sanitizeLogContext(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}
