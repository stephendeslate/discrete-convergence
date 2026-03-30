import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { email: 'test@test.com', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.email).toBe('test@test.com');
  });

  it('should redact token fields case-insensitively', () => {
    const input = { Token: 'abc', accessToken: 'xyz', Authorization: 'Bearer token' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Token).toBe('[REDACTED]');
    expect(result.accessToken).toBe('[REDACTED]');
    expect(result.Authorization).toBe('[REDACTED]');
  });

  it('should handle nested objects', () => {
    const input = { user: { name: 'Test', password: 'hidden' } };
    const result = sanitizeLogContext(input) as Record<string, Record<string, unknown>>;
    expect(result.user.password).toBe('[REDACTED]');
    expect(result.user.name).toBe('Test');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { password: 'secret1', name: 'A' },
      { password: 'secret2', name: 'B' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[1].password).toBe('[REDACTED]');
    expect(result[0].name).toBe('A');
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

  it('should redact secret and api_key fields', () => {
    const input = { secret: 'mysecret', api_key: 'key123', data: 'visible' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.secret).toBe('[REDACTED]');
    expect(result.api_key).toBe('[REDACTED]');
    expect(result.data).toBe('visible');
  });

  it('should handle deeply nested arrays within objects', () => {
    const input = {
      users: [
        { credentials: { password: 'hidden', token: 'abc' } },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const users = result.users as Array<Record<string, Record<string, unknown>>>;
    expect(users[0].credentials.password).toBe('[REDACTED]');
    expect(users[0].credentials.token).toBe('[REDACTED]');
  });
});
