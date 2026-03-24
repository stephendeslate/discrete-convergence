import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { username: 'admin', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.username).toBe('admin');
    expect(result.password).toBe('[REDACTED]');
  });

  it('should redact case-insensitively', () => {
    const input = { Password: 'abc', TOKEN: 'xyz', Authorization: 'Bearer foo' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Password).toBe('[REDACTED]');
    expect(result.TOKEN).toBe('[REDACTED]');
    expect(result.Authorization).toBe('[REDACTED]');
  });

  it('should handle deep nested objects', () => {
    const input = {
      user: {
        profile: {
          name: 'Test',
          passwordHash: 'hash123',
        },
      },
    };
    const result = sanitizeLogContext(input) as Record<string, Record<string, Record<string, unknown>>>;
    expect(result.user.profile.name).toBe('Test');
    expect(result.user.profile.passwordHash).toBe('[REDACTED]');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { name: 'User1', secret: 'hidden' },
      { name: 'User2', accessToken: 'tok123' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].name).toBe('User1');
    expect(result[0].secret).toBe('[REDACTED]');
    expect(result[1].name).toBe('User2');
    expect(result[1].accessToken).toBe('[REDACTED]');
  });

  it('should handle arrays nested inside objects', () => {
    const input = {
      users: [
        { password: 'pass1' },
        { password: 'pass2' },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, Array<Record<string, unknown>>>;
    expect(result.users[0].password).toBe('[REDACTED]');
    expect(result.users[1].password).toBe('[REDACTED]');
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
