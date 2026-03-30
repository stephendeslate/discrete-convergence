// TRACED:EM-MON-007 — Log sanitizer handles arrays recursively with case-insensitive matching
import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { username: 'user1', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.username).toBe('user1');
    expect(result.password).toBe('[REDACTED]');
  });

  it('should redact case-insensitively', () => {
    const input = { Password: 'abc', TOKEN: 'xyz', Authorization: 'bearer abc' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Password).toBe('[REDACTED]');
    expect(result.TOKEN).toBe('[REDACTED]');
    expect(result.Authorization).toBe('[REDACTED]');
  });

  it('should handle deep nesting', () => {
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
      { username: 'user1', password: 'pass1' },
      { username: 'user2', secret: 'sec2' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].username).toBe('user1');
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[1].username).toBe('user2');
    expect(result[1].secret).toBe('[REDACTED]');
  });

  it('should handle arrays nested within objects', () => {
    const input = {
      users: [
        { name: 'Alice', accessToken: 'tok1' },
        { name: 'Bob', accessToken: 'tok2' },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, Array<Record<string, unknown>>>;
    expect(result.users[0].name).toBe('Alice');
    expect(result.users[0].accessToken).toBe('[REDACTED]');
    expect(result.users[1].accessToken).toBe('[REDACTED]');
  });

  it('should handle null and undefined', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should pass through primitive values', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should redact all known sensitive keys', () => {
    const input = {
      password: 'p',
      passwordHash: 'h',
      token: 't',
      accessToken: 'a',
      secret: 's',
      authorization: 'auth',
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    for (const value of Object.values(result)) {
      expect(value).toBe('[REDACTED]');
    }
  });

  it('should handle mixed arrays with objects and primitives', () => {
    const input = [
      'plain string',
      42,
      { password: 'secret' },
      [{ token: 'tok' }],
    ];
    const result = sanitizeLogContext(input) as unknown[];
    expect(result[0]).toBe('plain string');
    expect(result[1]).toBe(42);
    expect((result[2] as Record<string, unknown>).password).toBe('[REDACTED]');
    expect(((result[3] as unknown[])[0] as Record<string, unknown>).token).toBe('[REDACTED]');
  });
});
