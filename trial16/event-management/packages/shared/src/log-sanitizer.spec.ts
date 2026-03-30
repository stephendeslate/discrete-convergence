import { sanitizeLogContext } from './log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { username: 'test', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.username).toBe('test');
  });

  it('should redact case-insensitively', () => {
    const input = { Password: 'secret', TOKEN: 'abc' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Password).toBe('[REDACTED]');
    expect(result.TOKEN).toBe('[REDACTED]');
  });

  it('should handle nested objects', () => {
    const input = { user: { password: 'secret', name: 'test' } };
    const result = sanitizeLogContext(input) as Record<string, Record<string, unknown>>;
    expect(result.user.password).toBe('[REDACTED]');
    expect(result.user.name).toBe('test');
  });

  it('should handle arrays recursively', () => {
    const input = [{ password: 'a' }, { token: 'b', name: 'c' }];
    const result = sanitizeLogContext(input) as Record<string, unknown>[];
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[1].token).toBe('[REDACTED]');
    expect(result[1].name).toBe('c');
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
      password: '1',
      passwordHash: '2',
      token: '3',
      accessToken: '4',
      secret: '5',
      authorization: '6',
      safe: 'keep',
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.passwordHash).toBe('[REDACTED]');
    expect(result.token).toBe('[REDACTED]');
    expect(result.accessToken).toBe('[REDACTED]');
    expect(result.secret).toBe('[REDACTED]');
    expect(result.authorization).toBe('[REDACTED]');
    expect(result.safe).toBe('keep');
  });
});
