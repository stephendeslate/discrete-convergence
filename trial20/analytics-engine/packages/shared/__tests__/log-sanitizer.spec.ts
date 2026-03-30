import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { username: 'alice', password: 'secret123' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ username: 'alice', password: '[REDACTED]' });
  });

  it('should redact token fields', () => {
    const input = { token: 'jwt-token-value', data: 'safe' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ token: '[REDACTED]', data: 'safe' });
  });

  it('should redact authorization headers', () => {
    const input = { authorization: 'Bearer abc', path: '/api' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ authorization: '[REDACTED]', path: '/api' });
  });

  it('should handle case-insensitive keys', () => {
    const input = { Password: 'pass', AccessToken: 'tok' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ Password: '[REDACTED]', AccessToken: '[REDACTED]' });
  });

  it('should handle deep nested objects', () => {
    const input = { user: { profile: { secret: 'hidden' }, name: 'bob' } };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ user: { profile: { secret: '[REDACTED]' }, name: 'bob' } });
  });

  it('should handle arrays recursively', () => {
    const input = [{ password: 'p1' }, { password: 'p2', safe: true }];
    const result = sanitizeLogContext(input);
    expect(result).toEqual([{ password: '[REDACTED]' }, { password: '[REDACTED]', safe: true }]);
  });

  it('should handle arrays within objects', () => {
    const input = { users: [{ token: 'abc' }, { name: 'alice' }] };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ users: [{ token: '[REDACTED]' }, { name: 'alice' }] });
  });

  it('should return null as-is', () => {
    expect(sanitizeLogContext(null)).toBeNull();
  });

  it('should return undefined as-is', () => {
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should return primitive values as-is', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should redact refreshToken and apiKey', () => {
    const input = { refreshToken: 'rt-123', apiKey: 'key-456', data: 'safe' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ refreshToken: '[REDACTED]', apiKey: '[REDACTED]', data: 'safe' });
  });

  it('should redact credentials field', () => {
    const input = { credentials: { user: 'admin', pass: 'xyz' }, info: 'ok' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ credentials: '[REDACTED]', info: 'ok' });
  });

  it('should redact passwordHash field', () => {
    const input = { passwordHash: '$2b$12$abc', email: 'user@test.com' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ passwordHash: '[REDACTED]', email: 'user@test.com' });
  });
});
