import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { username: 'admin', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.username).toBe('admin');
    expect(result.password).toBe('[REDACTED]');
  });

  it('should redact case-insensitively', () => {
    const input = { Password: 'val', TOKEN: 'val', Authorization: 'Bearer xyz' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Password).toBe('[REDACTED]');
    expect(result.TOKEN).toBe('[REDACTED]');
    expect(result.Authorization).toBe('[REDACTED]');
  });

  it('should handle deep nested objects', () => {
    const input = { user: { profile: { token: 'abc', name: 'John' } } };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const user = result.user as Record<string, unknown>;
    const profile = user.profile as Record<string, unknown>;
    expect(profile.token).toBe('[REDACTED]');
    expect(profile.name).toBe('John');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { password: 'secret', name: 'first' },
      { accessToken: 'tok', email: 'a@b.com' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[0].name).toBe('first');
    expect(result[1].accessToken).toBe('[REDACTED]');
    expect(result[1].email).toBe('a@b.com');
  });

  it('should handle mixed arrays with nested objects', () => {
    const input = { items: [{ secret: 'val' }, { data: { passwordHash: 'hash' } }] };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const items = result.items as Array<Record<string, unknown>>;
    expect(items[0].secret).toBe('[REDACTED]');
    const data = items[1].data as Record<string, unknown>;
    expect(data.passwordHash).toBe('[REDACTED]');
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

  it('should redact all sensitive keys', () => {
    const input = {
      password: 'a',
      passwordHash: 'b',
      token: 'c',
      accessToken: 'd',
      secret: 'e',
      authorization: 'f',
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    for (const key of Object.keys(input)) {
      expect(result[key]).toBe('[REDACTED]');
    }
  });
});
