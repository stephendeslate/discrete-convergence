import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should return null for null input', () => {
    expect(sanitizeLogContext(null)).toBeNull();
  });

  it('should return undefined for undefined input', () => {
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should return primitives unchanged', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should redact password field', () => {
    const input = { username: 'admin', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.username).toBe('admin');
    expect(result.password).toBe('[REDACTED]');
  });

  it('should redact token field case-insensitively', () => {
    const input = { Token: 'abc123', accessToken: 'xyz789' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Token).toBe('[REDACTED]');
    expect(result.accessToken).toBe('[REDACTED]');
  });

  it('should redact authorization field', () => {
    const input = { authorization: 'Bearer token', data: 'safe' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.authorization).toBe('[REDACTED]');
    expect(result.data).toBe('safe');
  });

  it('should redact passwordHash and secret fields', () => {
    const input = { passwordHash: 'hash', secret: 'mysecret' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.passwordHash).toBe('[REDACTED]');
    expect(result.secret).toBe('[REDACTED]');
  });

  it('should handle deep nested objects', () => {
    const input = {
      user: {
        name: 'John',
        credentials: {
          password: 'deep-secret',
          token: 'deep-token',
        },
      },
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const user = result.user as Record<string, unknown>;
    const creds = user.credentials as Record<string, unknown>;
    expect(creds.password).toBe('[REDACTED]');
    expect(creds.token).toBe('[REDACTED]');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { password: 'pw1', name: 'Alice' },
      { password: 'pw2', name: 'Bob' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[0].name).toBe('Alice');
    expect(result[1].password).toBe('[REDACTED]');
    expect(result[1].name).toBe('Bob');
  });

  it('should handle arrays nested inside objects', () => {
    const input = {
      users: [
        { token: 'tok1' },
        { authorization: 'auth1' },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const users = result.users as Array<Record<string, unknown>>;
    expect(users[0].token).toBe('[REDACTED]');
    expect(users[1].authorization).toBe('[REDACTED]');
  });

  it('should handle empty objects and arrays', () => {
    expect(sanitizeLogContext({})).toEqual({});
    expect(sanitizeLogContext([])).toEqual([]);
  });
});
