const SENSITIVE_KEYS = new Set(['password', 'secret', 'token', 'authorization', 'cookie', 'creditCard', 'ssn']);

export function sanitizeLogContext(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result[key] = '[REDACTED]';
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'object' && item !== null
          ? sanitizeLogContext(item as Record<string, unknown>)
          : item,
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeLogContext(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}
