import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password field', () => {
    const input = { username: 'alice', password: 'secret123' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ username: 'alice', password: '[REDACTED]' });
  });

  it('should redact nested sensitive fields', () => {
    const input = {
      user: {
        name: 'alice',
        credentials: {
          passwordHash: 'abc123hash',
          token: 'jwt-token-value',
        },
      },
    };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({
      user: {
        name: 'alice',
        credentials: {
          passwordHash: '[REDACTED]',
          token: '[REDACTED]',
        },
      },
    });
  });

  it('should handle arrays with sensitive data', () => {
    const input = [
      { name: 'alice', accessToken: 'tok1' },
      { name: 'bob', secret: 'sec1' },
    ];
    const result = sanitizeLogContext(input);
    expect(result).toEqual([
      { name: 'alice', accessToken: '[REDACTED]' },
      { name: 'bob', secret: '[REDACTED]' },
    ]);
  });

  it('should match keys case-insensitively', () => {
    const input = {
      PASSWORD: 'p1',
      Authorization: 'Bearer xyz',
      RefreshToken: 'rt1',
    };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({
      PASSWORD: '[REDACTED]',
      Authorization: '[REDACTED]',
      RefreshToken: '[REDACTED]',
    });
  });

  it('should not modify non-sensitive fields', () => {
    const input = { name: 'alice', email: 'alice@example.com', role: 'user' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ name: 'alice', email: 'alice@example.com', role: 'user' });
  });

  it('should handle null values', () => {
    expect(sanitizeLogContext(null)).toBeNull();
  });

  it('should handle undefined values', () => {
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should handle objects with null/undefined field values', () => {
    const input = { name: null, password: 'secret', token: undefined };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({
      name: null,
      password: '[REDACTED]',
      token: '[REDACTED]',
    });
  });

  it('should handle deeply nested arrays and objects', () => {
    const input = {
      data: [
        {
          items: [
            { authorization: 'Bearer abc', value: 42 },
          ],
        },
      ],
    };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({
      data: [
        {
          items: [
            { authorization: '[REDACTED]', value: 42 },
          ],
        },
      ],
    });
  });

  it('should return primitive values as-is', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });
});
