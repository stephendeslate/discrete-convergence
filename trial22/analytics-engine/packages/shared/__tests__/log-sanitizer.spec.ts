import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { email: 'test@example.com', password: 'secret123' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ email: 'test@example.com', password: '[REDACTED]' });
    expect((result as Record<string, unknown>).password).toBe('[REDACTED]');
  });

  it('should redact token fields case-insensitively', () => {
    const input = { Token: 'abc', accessToken: 'xyz' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ Token: '[REDACTED]', accessToken: '[REDACTED]' });
    expect((result as Record<string, unknown>).Token).toBe('[REDACTED]');
  });

  it('should redact authorization fields', () => {
    const input = { authorization: 'Bearer xxx' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ authorization: '[REDACTED]' });
    expect((result as Record<string, unknown>).authorization).toBe('[REDACTED]');
  });

  it('should handle nested objects', () => {
    const input = { user: { name: 'Alice', password: 'secret' } };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect((result.user as Record<string, unknown>).password).toBe('[REDACTED]');
    expect((result.user as Record<string, unknown>).name).toBe('Alice');
  });

  it('should handle arrays recursively', () => {
    const input = [{ password: 'a' }, { token: 'b' }];
    const result = sanitizeLogContext(input);
    expect(result).toEqual([{ password: '[REDACTED]' }, { token: '[REDACTED]' }]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle nested arrays', () => {
    const input = { users: [{ secret: 'x' }, { name: 'Bob' }] };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const users = result.users as Record<string, unknown>[];
    expect(users[0].secret).toBe('[REDACTED]');
    expect(users[1].name).toBe('Bob');
  });

  it('should return null for null input', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should return primitives unchanged', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
  });

  it('should redact refreshtoken', () => {
    const input = { refreshtoken: 'refresh-val' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ refreshtoken: '[REDACTED]' });
    expect((result as Record<string, unknown>).refreshtoken).toBe('[REDACTED]');
  });

  it('should redact apikey', () => {
    const input = { apikey: 'key-123', name: 'test' };
    const result = sanitizeLogContext(input);
    expect((result as Record<string, unknown>).apikey).toBe('[REDACTED]');
    expect((result as Record<string, unknown>).name).toBe('test');
  });

  it('should redact deeply nested sensitive keys', () => {
    const input = { level1: { level2: { level3: { passwordhash: 'hash' } } } };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const l1 = result.level1 as Record<string, unknown>;
    const l2 = l1.level2 as Record<string, unknown>;
    const l3 = l2.level3 as Record<string, unknown>;
    expect(l3.passwordhash).toBe('[REDACTED]');
  });
});
