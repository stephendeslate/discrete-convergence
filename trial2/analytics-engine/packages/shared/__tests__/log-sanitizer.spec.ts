import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { username: 'alice', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.username).toBe('alice');
    expect(result.password).toBe('[REDACTED]');
  });

  it('should handle case-insensitive key matching', () => {
    const input = { Password: 'val', TOKEN: 'val', Authorization: 'val' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Password).toBe('[REDACTED]');
    expect(result.TOKEN).toBe('[REDACTED]');
    expect(result.Authorization).toBe('[REDACTED]');
  });

  it('should redact all sensitive keys', () => {
    const input = {
      passwordHash: 'hash',
      token: 'tok',
      accessToken: 'at',
      secret: 's',
      authorization: 'Bearer x',
      refreshToken: 'rt',
      apiKey: 'ak',
      configEncrypted: 'enc',
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    for (const key of Object.keys(input)) {
      expect(result[key]).toBe('[REDACTED]');
    }
  });

  it('should handle deep nested objects', () => {
    const input = {
      user: {
        profile: {
          name: 'Alice',
          credentials: {
            password: 'deep-secret',
            token: 'deep-token',
          },
        },
      },
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const credentials = (
      (result.user as Record<string, unknown>).profile as Record<string, unknown>
    ).credentials as Record<string, unknown>;
    expect(credentials.password).toBe('[REDACTED]');
    expect(credentials.token).toBe('[REDACTED]');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { username: 'alice', password: 'pass1' },
      { username: 'bob', token: 'tok2' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[0].username).toBe('alice');
    expect(result[1].token).toBe('[REDACTED]');
    expect(result[1].username).toBe('bob');
  });

  it('should handle arrays inside objects', () => {
    const input = {
      users: [
        { name: 'alice', secret: 'sec' },
        { name: 'bob', authorization: 'auth' },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const users = result.users as Array<Record<string, unknown>>;
    expect(users[0].secret).toBe('[REDACTED]');
    expect(users[1].authorization).toBe('[REDACTED]');
  });

  it('should return null and undefined as-is', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should return primitives as-is', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should preserve non-sensitive keys', () => {
    const input = { method: 'GET', url: '/api/test', status: 200 };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.method).toBe('GET');
    expect(result.url).toBe('/api/test');
    expect(result.status).toBe(200);
  });
});
