const SENSITIVE_KEYS = [
  'password',
  'passwordHash',
  'token',
  'secret',
  'authorization',
  'cookie',
  'creditCard',
  'ssn',
  'connectionString',
];

export function sanitizeLogContext(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
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
