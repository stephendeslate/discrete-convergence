import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password field', () => {
    const input = { email: 'test@example.com', password: 'secret123' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ email: 'test@example.com', password: '[REDACTED]' });
  });

  it('should redact token field', () => {
    const input = { userId: '1', token: 'jwt-token-value' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ userId: '1', token: '[REDACTED]' });
  });

  it('should redact accessToken field', () => {
    const input = { accessToken: 'some-token' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ accessToken: '[REDACTED]' });
  });

  it('should redact authorization header', () => {
    const input = { authorization: 'Bearer xyz', url: '/api' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ authorization: '[REDACTED]', url: '/api' });
  });

  it('should redact secret field', () => {
    const input = { secret: 'my-secret', name: 'test' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ secret: '[REDACTED]', name: 'test' });
  });

  it('should handle deep nested objects', () => {
    const input = { user: { profile: { password: 'nested-secret', name: 'John' } } };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ user: { profile: { password: '[REDACTED]', name: 'John' } } });
  });

  it('should handle arrays recursively', () => {
    const input = [
      { password: 'secret1', name: 'Alice' },
      { password: 'secret2', name: 'Bob' },
    ];
    const result = sanitizeLogContext(input);
    expect(result).toEqual([
      { password: '[REDACTED]', name: 'Alice' },
      { password: '[REDACTED]', name: 'Bob' },
    ]);
  });

  it('should handle arrays nested in objects', () => {
    const input = { users: [{ token: 'abc' }, { token: 'def' }] };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ users: [{ token: '[REDACTED]' }, { token: '[REDACTED]' }] });
  });

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

  it('should handle case-insensitive key matching', () => {
    const input = { PASSWORD: 'secret', Token: 'jwt' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ PASSWORD: '[REDACTED]', Token: '[REDACTED]' });
  });

  it('should redact passwordHash field', () => {
    const input = { passwordHash: '$2b$12$hash', id: '1' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ passwordHash: '[REDACTED]', id: '1' });
  });

  it('should redact refresh_token field', () => {
    const input = { refresh_token: 'rt-value', type: 'bearer' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ refresh_token: '[REDACTED]', type: 'bearer' });
  });
});
