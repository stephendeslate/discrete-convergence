import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { username: 'alice', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.username).toBe('alice');
    expect(result.password).toBe('[REDACTED]');
  });

  it('should redact token fields case-insensitively', () => {
    const input = { Token: 'abc', accessToken: 'xyz' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Token).toBe('[REDACTED]');
    expect(result.accessToken).toBe('[REDACTED]');
  });

  it('should redact authorization header', () => {
    const input = { authorization: 'Bearer abc123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.authorization).toBe('[REDACTED]');
  });

  it('should redact secret fields', () => {
    const input = { secret: 'mysecret', data: 'visible' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.secret).toBe('[REDACTED]');
    expect(result.data).toBe('visible');
  });

  it('should redact passwordHash fields', () => {
    const input = { passwordHash: '$2b$12$...' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.passwordHash).toBe('[REDACTED]');
  });

  it('should handle deep nested objects', () => {
    const input = {
      user: {
        name: 'alice',
        credentials: {
          password: 'secret',
          token: 'jwt-token',
        },
      },
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const user = result.user as Record<string, unknown>;
    const creds = user.credentials as Record<string, unknown>;
    expect(creds.password).toBe('[REDACTED]');
    expect(creds.token).toBe('[REDACTED]');
    expect(user.name).toBe('alice');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { password: 'a', name: 'alice' },
      { password: 'b', name: 'bob' },
    ];
    const result = sanitizeLogContext(input) as Record<string, unknown>[];
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[0].name).toBe('alice');
    expect(result[1].password).toBe('[REDACTED]');
    expect(result[1].name).toBe('bob');
  });

  it('should handle nested arrays', () => {
    const input = {
      users: [
        { token: 'abc', id: 1 },
        { token: 'def', id: 2 },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const users = result.users as Record<string, unknown>[];
    expect(users[0].token).toBe('[REDACTED]');
    expect(users[0].id).toBe(1);
    expect(users[1].token).toBe('[REDACTED]');
  });

  it('should return null/undefined as-is', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should return primitives as-is', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });
});
