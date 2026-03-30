import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { email: 'test@example.com', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.email).toBe('test@example.com');
  });

  it('should redact token fields case-insensitively', () => {
    const input = { Token: 'abc', accessToken: 'xyz' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Token).toBe('[REDACTED]');
    expect(result.accessToken).toBe('[REDACTED]');
  });

  it('should handle nested objects', () => {
    const input = { user: { password: 'secret', name: 'John' } };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const user = result.user as Record<string, unknown>;
    expect(user.password).toBe('[REDACTED]');
    expect(user.name).toBe('John');
  });

  it('should handle arrays recursively', () => {
    const input = [{ password: 'a' }, { password: 'b' }];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[1].password).toBe('[REDACTED]');
  });

  it('should handle null and undefined', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should return primitives unchanged', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should redact authorization field', () => {
    const input = { authorization: 'Bearer xyz', data: 'ok' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.authorization).toBe('[REDACTED]');
    expect(result.data).toBe('ok');
  });

  it('should redact secret field', () => {
    const input = { secret: 'my-secret', name: 'test' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.secret).toBe('[REDACTED]');
  });

  it('should redact refreshToken field', () => {
    const input = { refreshToken: 'refresh123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.refreshToken).toBe('[REDACTED]');
  });

  it('should handle deeply nested arrays within objects', () => {
    const input = {
      users: [
        { credentials: { password: 'pass1', username: 'u1' } },
        { credentials: { password: 'pass2', username: 'u2' } },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const users = result.users as Array<Record<string, unknown>>;
    const cred0 = users[0].credentials as Record<string, unknown>;
    const cred1 = users[1].credentials as Record<string, unknown>;
    expect(cred0.password).toBe('[REDACTED]');
    expect(cred0.username).toBe('u1');
    expect(cred1.password).toBe('[REDACTED]');
    expect(cred1.username).toBe('u2');
  });

  it('should redact passwordHash field', () => {
    const input = { passwordHash: '$2b$12$hash', email: 'test@test.com' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.passwordHash).toBe('[REDACTED]');
  });
});
