import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { email: 'test@example.com', password: 'secret123' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ email: 'test@example.com', password: '[REDACTED]' });
  });

  it('should redact case-insensitively', () => {
    const input = { Password: 'secret', Authorization: 'Bearer xyz' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ Password: '[REDACTED]', Authorization: '[REDACTED]' });
  });

  it('should handle nested objects', () => {
    const input = { user: { email: 'test@example.com', passwordHash: 'abc123' } };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ user: { email: 'test@example.com', passwordHash: '[REDACTED]' } });
  });

  it('should handle arrays recursively', () => {
    const input = [
      { email: 'a@b.com', token: 'xyz' },
      { email: 'c@d.com', secret: 'abc' },
    ];
    const result = sanitizeLogContext(input);
    expect(result).toEqual([
      { email: 'a@b.com', token: '[REDACTED]' },
      { email: 'c@d.com', secret: '[REDACTED]' },
    ]);
  });

  it('should handle null and undefined', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should handle primitive values', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should redact accessToken and cookie', () => {
    const input = { accessToken: 'jwt-token', cookie: 'session=abc' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ accessToken: '[REDACTED]', cookie: '[REDACTED]' });
  });

  it('should handle deeply nested arrays inside objects', () => {
    const input = {
      users: [
        { name: 'Alice', credentials: { password: 'pass1' } },
        { name: 'Bob', credentials: { password: 'pass2' } },
      ],
    };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({
      users: [
        { name: 'Alice', credentials: { password: '[REDACTED]' } },
        { name: 'Bob', credentials: { password: '[REDACTED]' } },
      ],
    });
  });
});
