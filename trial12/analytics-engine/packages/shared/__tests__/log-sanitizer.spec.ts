import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { username: 'john', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.username).toBe('john');
  });

  it('should redact token fields', () => {
    const input = { token: 'abc123', accessToken: 'xyz', data: 'visible' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.token).toBe('[REDACTED]');
    expect(result.accessToken).toBe('[REDACTED]');
    expect(result.data).toBe('visible');
  });

  it('should redact authorization fields', () => {
    const input = { authorization: 'Bearer xyz', method: 'GET' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.authorization).toBe('[REDACTED]');
    expect(result.method).toBe('GET');
  });

  it('should handle deep nested objects', () => {
    const input = {
      user: {
        profile: {
          name: 'John',
          password: 'deep-secret',
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
      { password: 'pw1', name: 'a' },
      { token: 'tk1', name: 'b' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[0].name).toBe('a');
    expect(result[1].token).toBe('[REDACTED]');
    expect(result[1].name).toBe('b');
  });

  it('should handle arrays nested inside objects', () => {
    const input = {
      users: [
        { secret: 'abc', id: 1 },
        { apiKey: 'xyz', id: 2 },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const users = result.users as Array<Record<string, unknown>>;
    expect(users[0].secret).toBe('[REDACTED]');
    expect(users[0].id).toBe(1);
    expect(users[1].apiKey).toBe('[REDACTED]');
    expect(users[1].id).toBe(2);
  });

  it('should handle null and undefined values', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should handle primitive values', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should redact case-insensitively', () => {
    const input = { passwordHash: 'hash', Authorization: 'bearer tk' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.passwordHash).toBe('[REDACTED]');
    expect(result.Authorization).toBe('[REDACTED]');
  });

  it('should redact access_token and refresh_token fields', () => {
    const input = { access_token: 'at', refresh_token: 'rt', status: 'ok' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.access_token).toBe('[REDACTED]');
    expect(result.refresh_token).toBe('[REDACTED]');
    expect(result.status).toBe('ok');
  });
});
