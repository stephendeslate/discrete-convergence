import { sanitizeLogContext } from '@fleet-dispatch/shared';

/**
 * Log sanitizer tests — including array test cases.
 * TRACED:FD-MON-007
 */
describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { email: 'test@test.com', password: 'secret' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.email).toBe('test@test.com');
  });

  it('should handle arrays with sensitive data', () => {
    const input = [
      { name: 'user1', token: 'abc123' },
      { name: 'user2', secret: 'xyz789' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].token).toBe('[REDACTED]');
    expect(result[1].secret).toBe('[REDACTED]');
    expect(result[0].name).toBe('user1');
  });

  it('should handle deep nested objects', () => {
    const input = {
      level1: {
        level2: {
          level3: {
            authorization: 'Bearer token',
            safe: 'value',
          },
        },
      },
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const l1 = result.level1 as Record<string, unknown>;
    const l2 = l1.level2 as Record<string, unknown>;
    const l3 = l2.level3 as Record<string, unknown>;
    expect(l3.authorization).toBe('[REDACTED]');
    expect(l3.safe).toBe('value');
  });

  it('should be case-insensitive', () => {
    const input = { PASSWORD: 'x', Token: 'y', SECRET: 'z' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.PASSWORD).toBe('[REDACTED]');
    expect(result.Token).toBe('[REDACTED]');
    expect(result.SECRET).toBe('[REDACTED]');
  });

  it('should handle nested arrays in objects', () => {
    const input = {
      requests: [
        { path: '/api', headers: { authorization: 'Bearer xyz' } },
        { path: '/login', body: { password: 'pass123' } },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const requests = result.requests as Array<Record<string, unknown>>;
    const headers = requests[0].headers as Record<string, unknown>;
    const body = requests[1].body as Record<string, unknown>;
    expect(headers.authorization).toBe('[REDACTED]');
    expect(body.password).toBe('[REDACTED]');
  });

  it('should pass through null and undefined', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should pass through primitives', () => {
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext('hello')).toBe('hello');
  });
});
