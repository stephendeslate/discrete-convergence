// TRACED:FD-MON-005 — sanitizeLogContext redacts sensitive fields
import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('redacts top-level sensitive keys', () => {
    const input = { username: 'admin', password: 'secret123', token: 'jwt-abc' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.username).toBe('admin');
    expect(result.password).toBe('[REDACTED]');
    expect(result.token).toBe('[REDACTED]');
  });

  it('redacts case-insensitively', () => {
    const input = { Password: 'test', Authorization: 'Bearer xyz', AccessToken: 'tok' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Password).toBe('[REDACTED]');
    expect(result.Authorization).toBe('[REDACTED]');
    expect(result.AccessToken).toBe('[REDACTED]');
  });

  it('handles deep nested objects', () => {
    const input = { user: { profile: { secret: 'deep-secret', name: 'Jane' } } };
    const result = sanitizeLogContext(input) as Record<string, Record<string, Record<string, unknown>>>;
    expect(result.user.profile.secret).toBe('[REDACTED]');
    expect(result.user.profile.name).toBe('Jane');
  });

  it('handles arrays recursively', () => {
    const input = [
      { password: 'pw1', name: 'Alice' },
      { passwordHash: 'hash', role: 'admin' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[0].name).toBe('Alice');
    expect(result[1].passwordHash).toBe('[REDACTED]');
    expect(result[1].role).toBe('admin');
  });

  it('handles nested arrays within objects', () => {
    const input = {
      users: [
        { token: 'abc', email: 'a@b.com' },
        { authorization: 'Bearer x', id: 1 },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, Array<Record<string, unknown>>>;
    expect(result.users[0].token).toBe('[REDACTED]');
    expect(result.users[0].email).toBe('a@b.com');
    expect(result.users[1].authorization).toBe('[REDACTED]');
  });

  it('handles null and undefined', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('passes through primitives', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });
});
