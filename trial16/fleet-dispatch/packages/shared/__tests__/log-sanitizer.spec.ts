import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { username: 'user', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.username).toBe('user');
  });

  it('should redact token fields', () => {
    const input = { token: 'jwt-token-value', data: 'safe' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.token).toBe('[REDACTED]');
    expect(result.data).toBe('safe');
  });

  it('should redact authorization headers', () => {
    const input = { authorization: 'Bearer token', method: 'GET' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.authorization).toBe('[REDACTED]');
    expect(result.method).toBe('GET');
  });

  it('should redact accessToken fields', () => {
    const input = { accessToken: 'abc123', userId: '1' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.accessToken).toBe('[REDACTED]');
    expect(result.userId).toBe('1');
  });

  it('should redact secret fields', () => {
    const input = { secret: 'my-secret', name: 'test' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.secret).toBe('[REDACTED]');
    expect(result.name).toBe('test');
  });

  it('should redact passwordHash fields', () => {
    const input = { passwordHash: '$2b$12$hash', email: 'test@test.com' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.passwordHash).toBe('[REDACTED]');
    expect(result.email).toBe('test@test.com');
  });

  it('should redact refreshToken fields', () => {
    const input = { refreshToken: 'refresh-value', status: 'ok' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.refreshToken).toBe('[REDACTED]');
    expect(result.status).toBe('ok');
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
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const user = result.user as Record<string, unknown>;
    const profile = user.profile as Record<string, unknown>;
    expect(profile.password).toBe('[REDACTED]');
    expect(profile.name).toBe('John');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { password: 'secret1', id: 1 },
      { token: 'token2', id: 2 },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[0].id).toBe(1);
    expect(result[1].token).toBe('[REDACTED]');
    expect(result[1].id).toBe(2);
  });

  it('should handle arrays inside objects', () => {
    const input = {
      users: [
        { password: 'p1', name: 'Alice' },
        { secret: 's1', name: 'Bob' },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const users = result.users as Array<Record<string, unknown>>;
    expect(users[0].password).toBe('[REDACTED]');
    expect(users[0].name).toBe('Alice');
    expect(users[1].secret).toBe('[REDACTED]');
    expect(users[1].name).toBe('Bob');
  });

  it('should return null for null input', () => {
    expect(sanitizeLogContext(null)).toBeNull();
  });

  it('should return undefined for undefined input', () => {
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should return primitive values unchanged', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should be case-insensitive for key matching', () => {
    const input = { PASSWORD: 'upper', Token: 'mixed', apiKey: 'camel' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.PASSWORD).toBe('[REDACTED]');
    expect(result.Token).toBe('[REDACTED]');
    expect(result.apiKey).toBe('[REDACTED]');
  });
});
