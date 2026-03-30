import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password field', () => {
    const input = { email: 'test@test.com', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.email).toBe('test@test.com');
  });

  it('should redact token field', () => {
    const input = { token: 'jwt-abc', name: 'test' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.token).toBe('[REDACTED]');
    expect(result.name).toBe('test');
  });

  it('should redact authorization header', () => {
    const input = { authorization: 'Bearer xyz' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.authorization).toBe('[REDACTED]');
  });

  it('should handle nested objects', () => {
    const input = { user: { password: 'secret', name: 'test' } };
    const result = sanitizeLogContext(input) as Record<string, Record<string, unknown>>;
    expect(result.user.password).toBe('[REDACTED]');
    expect(result.user.name).toBe('test');
  });

  it('should handle arrays', () => {
    const input = [{ password: 'a' }, { password: 'b' }];
    const result = sanitizeLogContext(input) as Record<string, unknown>[];
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[1].password).toBe('[REDACTED]');
  });

  it('should handle arrays within objects', () => {
    const input = { users: [{ password: 'x', name: 'a' }] };
    const result = sanitizeLogContext(input) as Record<string, Record<string, unknown>[]>;
    expect(result.users[0].password).toBe('[REDACTED]');
    expect(result.users[0].name).toBe('a');
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
  });

  it('should redact case-insensitively', () => {
    const input = { accessToken: 'tok123', Secret: 'shhh' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.accessToken).toBe('[REDACTED]');
    expect(result.Secret).toBe('[REDACTED]');
  });
});
