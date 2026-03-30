import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { email: 'test@test.com', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.email).toBe('test@test.com');
  });

  it('should redact token fields case-insensitively', () => {
    const input = { Token: 'abc', accessToken: 'xyz', name: 'test' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Token).toBe('[REDACTED]');
    expect(result.accessToken).toBe('[REDACTED]');
    expect(result.name).toBe('test');
  });

  it('should handle deep nested objects', () => {
    const input = { user: { profile: { password: 'deep-secret' } } };
    const result = sanitizeLogContext(input) as Record<string, Record<string, Record<string, string>>>;
    expect(result.user.profile.password).toBe('[REDACTED]');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { password: 'pw1', name: 'a' },
      { secret: 'sec', name: 'b' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[0].name).toBe('a');
    expect(result[1].secret).toBe('[REDACTED]');
    expect(result[1].name).toBe('b');
  });

  it('should handle nested arrays', () => {
    const input = { items: [{ authorization: 'Bearer xyz' }] };
    const result = sanitizeLogContext(input) as Record<string, Array<Record<string, unknown>>>;
    expect(result.items[0].authorization).toBe('[REDACTED]');
  });

  it('should handle null and undefined', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should handle primitive values', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
  });

  it('should redact passwordHash field', () => {
    const input = { passwordHash: 'hashed', id: '1' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.passwordHash).toBe('[REDACTED]');
    expect(result.id).toBe('1');
  });
});
