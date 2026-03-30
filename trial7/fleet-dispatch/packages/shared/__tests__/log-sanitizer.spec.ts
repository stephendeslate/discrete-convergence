import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { username: 'admin', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.username).toBe('admin');
  });

  it('should redact token fields case-insensitively', () => {
    const input = { Token: 'abc123', accessToken: 'xyz789' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Token).toBe('[REDACTED]');
    expect(result.accessToken).toBe('[REDACTED]');
  });

  it('should redact authorization header', () => {
    const input = { authorization: 'Bearer token123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.authorization).toBe('[REDACTED]');
  });

  it('should redact secret fields', () => {
    const input = { secret: 'my-secret', name: 'test' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.secret).toBe('[REDACTED]');
    expect(result.name).toBe('test');
  });

  it('should redact passwordHash fields', () => {
    const input = { passwordHash: '$2b$12$hash' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.passwordHash).toBe('[REDACTED]');
  });

  it('should handle deep nested objects', () => {
    const input = {
      user: {
        profile: {
          password: 'nested-secret',
          name: 'John',
        },
      },
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const user = result.user as Record<string, unknown>;
    const profile = user.profile as Record<string, unknown>;
    expect(profile.password).toBe('[REDACTED]');
    expect(profile.name).toBe('John');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { password: 'secret1', name: 'a' },
      { token: 'tok1', name: 'b' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[0].name).toBe('a');
    expect(result[1].token).toBe('[REDACTED]');
    expect(result[1].name).toBe('b');
  });

  it('should handle arrays nested within objects', () => {
    const input = {
      users: [
        { password: 'p1', name: 'Alice' },
        { authorization: 'auth', name: 'Bob' },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const users = result.users as Array<Record<string, unknown>>;
    expect(users[0].password).toBe('[REDACTED]');
    expect(users[1].authorization).toBe('[REDACTED]');
  });

  it('should return null as-is', () => {
    expect(sanitizeLogContext(null)).toBeNull();
  });

  it('should return undefined as-is', () => {
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should return primitives as-is', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });
});
