import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { email: 'test@test.com', password: 'secret123' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ email: 'test@test.com', password: '[REDACTED]' });
  });

  it('should redact token fields', () => {
    const input = { token: 'jwt-token-value', name: 'test' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ token: '[REDACTED]', name: 'test' });
  });

  it('should redact authorization field', () => {
    const input = { authorization: 'Bearer xyz', url: '/api' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ authorization: '[REDACTED]', url: '/api' });
  });

  it('should redact accessToken field', () => {
    const input = { accessToken: 'abc123' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ accessToken: '[REDACTED]' });
  });

  it('should redact secret field', () => {
    const input = { secret: 'mysecret' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ secret: '[REDACTED]' });
  });

  it('should handle deep nested objects', () => {
    const input = {
      user: {
        profile: {
          password: 'nested-secret',
          name: 'John',
        },
      },
    };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({
      user: {
        profile: {
          password: '[REDACTED]',
          name: 'John',
        },
      },
    });
  });

  it('should handle arrays', () => {
    const input = [
      { password: 'pw1', name: 'user1' },
      { password: 'pw2', name: 'user2' },
    ];
    const result = sanitizeLogContext(input);
    expect(result).toEqual([
      { password: '[REDACTED]', name: 'user1' },
      { password: '[REDACTED]', name: 'user2' },
    ]);
  });

  it('should handle arrays nested in objects', () => {
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

  it('should handle null and undefined', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should handle primitive values', () => {
    expect(sanitizeLogContext('string')).toBe('string');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should be case-insensitive for key matching', () => {
    const input = { Password: 'secret', TOKEN: 'abc' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ Password: '[REDACTED]', TOKEN: '[REDACTED]' });
  });

  it('should redact refreshToken field', () => {
    const input = { refreshToken: 'refresh-value' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ refreshToken: '[REDACTED]' });
  });

  it('should redact passwordHash field', () => {
    const input = { passwordHash: '$2b$12$...' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ passwordHash: '[REDACTED]' });
  });
});
