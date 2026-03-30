import { sanitizeLogContext } from './log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should return null/undefined as-is', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should return primitives as-is', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should redact sensitive keys case-insensitively', () => {
    const input = {
      username: 'john',
      password: 'secret123',
      Password: 'secret456',
      PASSWORD: 'secret789',
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.username).toBe('john');
    expect(result.password).toBe('[REDACTED]');
    expect(result.Password).toBe('[REDACTED]');
    expect(result.PASSWORD).toBe('[REDACTED]');
  });

  it('should redact all sensitive key variants', () => {
    const input = {
      token: 'abc',
      accessToken: 'def',
      access_token: 'ghi',
      secret: 'jkl',
      authorization: 'Bearer xyz',
      passwordHash: 'hash123',
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.token).toBe('[REDACTED]');
    expect(result.accessToken).toBe('[REDACTED]');
    expect(result.access_token).toBe('[REDACTED]');
    expect(result.secret).toBe('[REDACTED]');
    expect(result.authorization).toBe('[REDACTED]');
    expect(result.passwordHash).toBe('[REDACTED]');
  });

  it('should handle nested objects', () => {
    const input = {
      user: {
        email: 'test@test.com',
        password: 'secret',
      },
    };
    const result = sanitizeLogContext(input) as Record<string, Record<string, unknown>>;
    expect(result.user.email).toBe('test@test.com');
    expect(result.user.password).toBe('[REDACTED]');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { name: 'user1', password: 'pass1' },
      { name: 'user2', token: 'tok2' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].name).toBe('user1');
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[1].name).toBe('user2');
    expect(result[1].token).toBe('[REDACTED]');
  });

  it('should handle deeply nested objects with arrays', () => {
    const input = {
      data: {
        users: [
          { id: 1, authorization: 'Bearer tok' },
        ],
      },
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const users = (result.data as Record<string, unknown>).users as Array<Record<string, unknown>>;
    expect(users[0].id).toBe(1);
    expect(users[0].authorization).toBe('[REDACTED]');
  });

  it('should preserve non-sensitive fields in objects', () => {
    const input = { method: 'POST', url: '/api/test', statusCode: 200 };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.method).toBe('POST');
    expect(result.url).toBe('/api/test');
    expect(result.statusCode).toBe(200);
  });
});
