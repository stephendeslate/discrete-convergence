import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { email: 'test@test.com', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.email).toBe('test@test.com');
  });

  it('should redact token fields', () => {
    const input = { token: 'jwt-token-value', userId: '123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.token).toBe('[REDACTED]');
    expect(result.userId).toBe('123');
  });

  it('should redact authorization fields', () => {
    const input = { authorization: 'Bearer xyz', method: 'GET' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.authorization).toBe('[REDACTED]');
    expect(result.method).toBe('GET');
  });

  it('should redact accessToken and access_token fields', () => {
    const input = { accessToken: 'abc', access_token: 'def' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.accessToken).toBe('[REDACTED]');
    expect(result.access_token).toBe('[REDACTED]');
  });

  it('should redact secret and apikey fields', () => {
    const input = { secret: 's3cret', apikey: 'key123', api_key: 'key456' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.secret).toBe('[REDACTED]');
    expect(result.apikey).toBe('[REDACTED]');
    expect(result.api_key).toBe('[REDACTED]');
  });

  it('should handle deep nested objects', () => {
    const input = {
      user: {
        name: 'Test',
        credentials: {
          password: 'deep-secret',
          token: 'nested-token',
        },
      },
    };
    const result = sanitizeLogContext(input) as Record<string, Record<string, Record<string, unknown>>>;
    expect(result.user.credentials.password).toBe('[REDACTED]');
    expect(result.user.credentials.token).toBe('[REDACTED]');
    expect(result.user.name).toBe('Test');
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

  it('should handle arrays with nested objects', () => {
    const input = {
      items: [
        { token: 'tok1', id: 1 },
        { authorization: 'Bearer x', id: 2 },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, Array<Record<string, unknown>>>;
    expect(result.items[0].token).toBe('[REDACTED]');
    expect(result.items[0].id).toBe(1);
    expect(result.items[1].authorization).toBe('[REDACTED]');
    expect(result.items[1].id).toBe(2);
  });

  it('should return null and undefined as-is', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should return primitives as-is', () => {
    expect(sanitizeLogContext('string')).toBe('string');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should be case-insensitive for key matching', () => {
    const input = { PASSWORD: 'upper', Token: 'mixed', SECRET: 'caps' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.PASSWORD).toBe('[REDACTED]');
    expect(result.Token).toBe('[REDACTED]');
    expect(result.SECRET).toBe('[REDACTED]');
  });

  it('should handle passwordHash field', () => {
    const input = { passwordHash: '$2b$12$hashvalue', email: 'a@b.com' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.passwordHash).toBe('[REDACTED]');
    expect(result.email).toBe('a@b.com');
  });

  it('should handle refreshToken and refresh_token fields', () => {
    const input = { refreshToken: 'rt1', refresh_token: 'rt2' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.refreshToken).toBe('[REDACTED]');
    expect(result.refresh_token).toBe('[REDACTED]');
  });
});
