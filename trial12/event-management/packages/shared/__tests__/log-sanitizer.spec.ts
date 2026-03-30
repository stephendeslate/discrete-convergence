import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { username: 'admin', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.username).toBe('admin');
  });

  it('should redact token fields', () => {
    const input = { token: 'jwt-token-value', data: 'safe' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.token).toBe('[REDACTED]');
    expect(result.data).toBe('safe');
  });

  it('should redact authorization headers', () => {
    const input = { authorization: 'Bearer xyz', url: '/api' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.authorization).toBe('[REDACTED]');
    expect(result.url).toBe('/api');
  });

  it('should redact accessToken fields', () => {
    const input = { accessToken: 'abc123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.accessToken).toBe('[REDACTED]');
  });

  it('should redact access_token fields', () => {
    const input = { access_token: 'abc123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.access_token).toBe('[REDACTED]');
  });

  it('should redact secret fields', () => {
    const input = { secret: 'my-secret', name: 'test' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.secret).toBe('[REDACTED]');
    expect(result.name).toBe('test');
  });

  it('should redact passwordHash fields', () => {
    const input = { passwordHash: '$2b$12$...' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.passwordHash).toBe('[REDACTED]');
  });

  it('should handle deep nested objects', () => {
    const input = {
      user: {
        profile: {
          name: 'John',
          password: 'hidden',
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
      { password: 'secret1', name: 'user1' },
      { password: 'secret2', name: 'user2' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[0].name).toBe('user1');
    expect(result[1].password).toBe('[REDACTED]');
    expect(result[1].name).toBe('user2');
  });

  it('should handle arrays nested inside objects', () => {
    const input = {
      users: [
        { token: 'abc', role: 'admin' },
        { token: 'def', role: 'user' },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const users = result.users as Array<Record<string, unknown>>;
    expect(users[0].token).toBe('[REDACTED]');
    expect(users[0].role).toBe('admin');
    expect(users[1].token).toBe('[REDACTED]');
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
    const input = { PASSWORD: 'secret', Token: 'abc', AUTHORIZATION: 'bearer xyz' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.PASSWORD).toBe('[REDACTED]');
    expect(result.Token).toBe('[REDACTED]');
    expect(result.AUTHORIZATION).toBe('[REDACTED]');
  });
});
