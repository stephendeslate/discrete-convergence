// TRACED:FD-SHARED-003 — Log sanitization utilities
const SENSITIVE_KEYS = ['password', 'passwordHash', 'token', 'secret', 'authorization'];

export function sanitizeLogData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.some((sk) => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeLogData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
