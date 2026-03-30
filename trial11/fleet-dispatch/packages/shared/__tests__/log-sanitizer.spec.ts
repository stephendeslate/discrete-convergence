import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { email: 'user@test.com', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.email).toBe('user@test.com');
  });

  it('should redact token fields case-insensitively', () => {
    const input = { Token: 'abc123', accessToken: 'def456' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Token).toBe('[REDACTED]');
    expect(result.accessToken).toBe('[REDACTED]');
  });

  it('should redact authorization headers', () => {
    const input = { authorization: 'Bearer xyz', method: 'GET' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.authorization).toBe('[REDACTED]');
    expect(result.method).toBe('GET');
  });

  it('should handle deep nested objects', () => {
    const input = {
      user: {
        profile: {
          name: 'Test',
          secret: 'hidden',
        },
      },
    };
    const result = sanitizeLogContext(input) as Record<string, Record<string, Record<string, unknown>>>;
    expect(result.user.profile.secret).toBe('[REDACTED]');
    expect(result.user.profile.name).toBe('Test');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { password: 'secret1', name: 'User1' },
      { password: 'secret2', name: 'User2' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[0].name).toBe('User1');
    expect(result[1].password).toBe('[REDACTED]');
    expect(result[1].name).toBe('User2');
  });

  it('should handle nested arrays', () => {
    const input = {
      data: [{ apiKey: 'key1' }, { api_key: 'key2' }],
    };
    const result = sanitizeLogContext(input) as Record<string, Array<Record<string, unknown>>>;
    expect(result.data[0].apiKey).toBe('[REDACTED]');
    expect(result.data[1].api_key).toBe('[REDACTED]');
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

  it('should redact passwordHash and refreshToken', () => {
    const input = { passwordHash: 'hashed', refreshToken: 'refresh' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.passwordHash).toBe('[REDACTED]');
    expect(result.refreshToken).toBe('[REDACTED]');
  });

  it('should redact access_token and refresh_token', () => {
    const input = { access_token: 'at', refresh_token: 'rt', userId: '123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.access_token).toBe('[REDACTED]');
    expect(result.refresh_token).toBe('[REDACTED]');
    expect(result.userId).toBe('123');
  });
});
