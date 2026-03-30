import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should return null for null input', () => {
    expect(sanitizeLogContext(null)).toBeNull();
  });

  it('should return undefined for undefined input', () => {
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should return primitives unchanged', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should redact password fields', () => {
    const input = { email: 'test@example.com', password: 'secret123' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ email: 'test@example.com', password: '[REDACTED]' });
  });

  it('should redact token fields case-insensitively', () => {
    const input = { accessToken: 'jwt-value', data: 'safe' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ accessToken: '[REDACTED]', data: 'safe' });
  });

  it('should redact authorization headers', () => {
    const input = { authorization: 'Bearer xxx', url: '/api' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ authorization: '[REDACTED]', url: '/api' });
  });

  it('should redact secret fields', () => {
    const input = { secret: 'my-secret', name: 'test' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ secret: '[REDACTED]', name: 'test' });
  });

  it('should redact passwordHash fields', () => {
    const input = { passwordHash: '$2a$12$hash', email: 'test@test.com' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ passwordHash: '[REDACTED]', email: 'test@test.com' });
  });

  it('should handle deep nested objects', () => {
    const input = { user: { profile: { password: 'deep-secret', name: 'John' } } };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ user: { profile: { password: '[REDACTED]', name: 'John' } } });
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

  it('should handle arrays nested inside objects', () => {
    const input = {
      users: [
        { token: 'abc', id: '1' },
        { token: 'def', id: '2' },
      ],
    };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({
      users: [
        { token: '[REDACTED]', id: '1' },
        { token: '[REDACTED]', id: '2' },
      ],
    });
  });

  it('should handle empty objects', () => {
    expect(sanitizeLogContext({})).toEqual({});
  });

  it('should handle empty arrays', () => {
    expect(sanitizeLogContext([])).toEqual([]);
  });
});
