import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { username: 'admin', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.username).toBe('admin');
    expect(result.password).toBe('[REDACTED]');
  });

  it('should redact case-insensitively', () => {
    const input = { Password: 'abc', TOKEN: 'xyz', Authorization: 'bearer ...' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Password).toBe('[REDACTED]');
    expect(result.TOKEN).toBe('[REDACTED]');
    expect(result.Authorization).toBe('[REDACTED]');
  });

  it('should handle deep nested objects', () => {
    const input = {
      user: {
        profile: {
          name: 'John',
          secret: 'hidden',
        },
      },
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const user = result.user as Record<string, unknown>;
    const profile = user.profile as Record<string, unknown>;
    expect(profile.name).toBe('John');
    expect(profile.secret).toBe('[REDACTED]');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { name: 'user1', password: 'pass1' },
      { name: 'user2', accessToken: 'tok2' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].name).toBe('user1');
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[1].name).toBe('user2');
    expect(result[1].accessToken).toBe('[REDACTED]');
  });

  it('should handle nested arrays within objects', () => {
    const input = {
      users: [
        { email: 'a@b.com', passwordHash: 'hash' },
        { email: 'c@d.com', refreshToken: 'rt' },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const users = result.users as Array<Record<string, unknown>>;
    expect(users[0].email).toBe('a@b.com');
    expect(users[0].passwordHash).toBe('[REDACTED]');
    expect(users[1].refreshToken).toBe('[REDACTED]');
  });

  it('should return null and undefined as-is', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should return primitives as-is', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should redact apiKey field', () => {
    const input = { apiKey: 'sk-1234', name: 'service' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.apiKey).toBe('[REDACTED]');
    expect(result.name).toBe('service');
  });
});
