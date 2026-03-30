import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { user: 'admin', password: 'secret123' };
    const result = sanitizeLogContext(input) as any;

    expect(result.password).toBe('[REDACTED]');
    expect(result.user).toBe('admin');
  });

  it('should redact nested sensitive fields', () => {
    const input = { data: { token: 'jwt-token', name: 'test' } };
    const result = sanitizeLogContext(input) as any;

    expect(result.data.token).toBe('[REDACTED]');
    expect(result.data.name).toBe('test');
  });

  it('should handle arrays with sensitive data', () => {
    const input = { items: [{ authorization: 'Bearer abc' }] };
    const result = sanitizeLogContext(input) as any;

    expect(result.items[0].authorization).toBe('[REDACTED]');
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('should return primitive values unchanged', () => {
    const result = sanitizeLogContext('just a string' as any);

    expect(result).toBe('just a string');
    expect(typeof result).toBe('string');
  });

  it('should redact case-insensitively', () => {
    const input = { PasswordHash: 'hash123', AccessToken: 'tok' };
    const result = sanitizeLogContext(input) as any;

    expect(result.PasswordHash).toBe('[REDACTED]');
    expect(result.AccessToken).toBe('[REDACTED]');
  });
});
