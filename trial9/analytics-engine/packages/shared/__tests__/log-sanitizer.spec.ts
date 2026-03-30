import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { email: 'test@test.com', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.email).toBe('test@test.com');
  });

  it('should redact token fields case-insensitively', () => {
    const input = { Token: 'abc123', accessToken: 'xyz' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Token).toBe('[REDACTED]');
    expect(result.accessToken).toBe('[REDACTED]');
  });

  it('should redact authorization headers', () => {
    const input = { authorization: 'Bearer token123', url: '/api' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.authorization).toBe('[REDACTED]');
    expect(result.url).toBe('/api');
  });

  it('should redact secret and apikey fields', () => {
    const input = { secret: 'mysecret', apikey: 'key123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.secret).toBe('[REDACTED]');
    expect(result.apikey).toBe('[REDACTED]');
  });

  it('should handle deep nested objects', () => {
    const input = {
      user: {
        profile: {
          password: 'deep-secret',
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
      { password: 'secret2', id: 2 },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[0].id).toBe(1);
    expect(result[1].password).toBe('[REDACTED]');
    expect(result[1].id).toBe(2);
  });

  it('should handle arrays nested inside objects', () => {
    const input = {
      users: [
        { token: 'tok1', name: 'A' },
        { token: 'tok2', name: 'B' },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const users = result.users as Array<Record<string, unknown>>;
    expect(users[0].token).toBe('[REDACTED]');
    expect(users[0].name).toBe('A');
    expect(users[1].token).toBe('[REDACTED]');
  });

  it('should return null and undefined as-is', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should return primitives unchanged', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should handle passwordHash and refreshToken', () => {
    const input = { passwordHash: 'hash123', refreshToken: 'refresh' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.passwordHash).toBe('[REDACTED]');
    expect(result.refreshToken).toBe('[REDACTED]');
  });
});
