import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { username: 'john', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.username).toBe('john');
  });

  it('should redact token fields', () => {
    const input = { token: 'abc123', data: 'visible' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.token).toBe('[REDACTED]');
    expect(result.data).toBe('visible');
  });

  it('should redact authorization headers', () => {
    const input = { authorization: 'Bearer xyz', method: 'GET' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.authorization).toBe('[REDACTED]');
    expect(result.method).toBe('GET');
  });

  it('should redact accessToken fields', () => {
    const input = { accessToken: 'tok123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.accessToken).toBe('[REDACTED]');
  });

  it('should redact secret fields', () => {
    const input = { secret: 'mysecret', value: 42 };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.secret).toBe('[REDACTED]');
    expect(result.value).toBe(42);
  });

  it('should redact passwordHash fields', () => {
    const input = { passwordHash: '$2b$12$hash', email: 'test@test.com' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.passwordHash).toBe('[REDACTED]');
    expect(result.email).toBe('test@test.com');
  });

  it('should handle deep nested objects', () => {
    const input = { user: { profile: { password: 'secret' } } };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const user = result.user as Record<string, unknown>;
    const profile = user.profile as Record<string, unknown>;
    expect(profile.password).toBe('[REDACTED]');
  });

  it('should handle arrays with objects containing sensitive data', () => {
    const input = [
      { username: 'a', password: 'p1' },
      { username: 'b', token: 't1' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[0].username).toBe('a');
    expect(result[1].token).toBe('[REDACTED]');
    expect(result[1].username).toBe('b');
  });

  it('should handle arrays within objects', () => {
    const input = {
      users: [
        { name: 'a', password: 'x' },
        { name: 'b', secret: 'y' },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const users = result.users as Array<Record<string, unknown>>;
    expect(users[0].password).toBe('[REDACTED]');
    expect(users[1].secret).toBe('[REDACTED]');
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

  it('should be case-insensitive for sensitive key matching', () => {
    const input = { Password: 'abc', TOKEN: 'xyz', Authorization: 'bearer' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Password).toBe('[REDACTED]');
    expect(result.TOKEN).toBe('[REDACTED]');
    expect(result.Authorization).toBe('[REDACTED]');
  });
});
