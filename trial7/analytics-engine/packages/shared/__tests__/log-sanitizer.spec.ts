import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password field', () => {
    const result = sanitizeLogContext({ password: 'secret123' });
    expect(result).toEqual({ password: '[REDACTED]' });
  });

  it('should redact passwordHash field (case-insensitive)', () => {
    const result = sanitizeLogContext({ passwordHash: 'hash123' });
    expect(result).toEqual({ passwordHash: '[REDACTED]' });
  });

  it('should redact token field', () => {
    const result = sanitizeLogContext({ token: 'jwt-token-value' });
    expect(result).toEqual({ token: '[REDACTED]' });
  });

  it('should redact accessToken field', () => {
    const result = sanitizeLogContext({ accessToken: 'bearer-token' });
    expect(result).toEqual({ accessToken: '[REDACTED]' });
  });

  it('should redact secret field', () => {
    const result = sanitizeLogContext({ secret: 'my-secret' });
    expect(result).toEqual({ secret: '[REDACTED]' });
  });

  it('should redact authorization field', () => {
    const result = sanitizeLogContext({ authorization: 'Bearer xyz' });
    expect(result).toEqual({ authorization: '[REDACTED]' });
  });

  it('should handle deep nested objects', () => {
    const input = {
      user: {
        name: 'John',
        credentials: {
          password: 'deep-secret',
          token: 'deep-token',
        },
      },
    };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({
      user: {
        name: 'John',
        credentials: {
          password: '[REDACTED]',
          token: '[REDACTED]',
        },
      },
    });
  });

  it('should handle arrays recursively', () => {
    const input = [
      { password: 'secret1', name: 'user1' },
      { password: 'secret2', name: 'user2' },
    ];
    const result = sanitizeLogContext(input);
    expect(result).toEqual([
      { password: '[REDACTED]', name: 'user1' },
      { password: '[REDACTED]', name: 'user2' },
    ]);
  });

  it('should handle nested arrays', () => {
    const input = {
      users: [
        { token: 'tok1' },
        { token: 'tok2' },
      ],
    };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({
      users: [
        { token: '[REDACTED]' },
        { token: '[REDACTED]' },
      ],
    });
  });

  it('should return null for null input', () => {
    expect(sanitizeLogContext(null)).toBeNull();
  });

  it('should return undefined for undefined input', () => {
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should return primitive values unchanged', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should not redact non-sensitive fields', () => {
    const input = { username: 'john', email: 'john@example.com' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual(input);
  });
});
