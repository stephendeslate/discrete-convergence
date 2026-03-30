import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { email: 'test@example.com', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.email).toBe('test@example.com');
  });

  it('should redact token fields', () => {
    const input = { token: 'abc123', accessToken: 'xyz789' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.token).toBe('[REDACTED]');
    expect(result.accessToken).toBe('[REDACTED]');
  });

  it('should redact authorization header', () => {
    const input = { authorization: 'Bearer token123', method: 'GET' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.authorization).toBe('[REDACTED]');
    expect(result.method).toBe('GET');
  });

  it('should handle nested objects', () => {
    const input = { user: { name: 'Alice', password: 'hidden' } };
    const result = sanitizeLogContext(input) as Record<string, Record<string, unknown>>;
    expect(result.user.password).toBe('[REDACTED]');
    expect(result.user.name).toBe('Alice');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { password: 'secret1', name: 'Alice' },
      { password: 'secret2', name: 'Bob' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[1].password).toBe('[REDACTED]');
    expect(result[0].name).toBe('Alice');
  });

  it('should handle null and undefined', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should handle primitive values', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should be case-insensitive for key matching', () => {
    const input = { passwordHash: 'hashed', Secret: 'top-secret', refreshToken: 'rt' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.passwordHash).toBe('[REDACTED]');
    expect(result.Secret).toBe('[REDACTED]');
    expect(result.refreshToken).toBe('[REDACTED]');
  });

  it('should handle deeply nested arrays within objects', () => {
    const input = {
      requests: [
        { headers: { authorization: 'Bearer abc' }, url: '/api' },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const requests = result.requests as Array<Record<string, Record<string, unknown>>>;
    expect(requests[0].headers.authorization).toBe('[REDACTED]');
    expect(requests[0].url).toBe('/api');
  });
});
