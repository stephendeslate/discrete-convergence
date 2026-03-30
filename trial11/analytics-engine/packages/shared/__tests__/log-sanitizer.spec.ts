import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { email: 'test@example.com', password: 'secret123' };
    const result = sanitizeLogContext(input);

    expect(result).toEqual({ email: 'test@example.com', password: '[REDACTED]' });
    expect((result as Record<string, unknown>).email).toBe('test@example.com');
  });

  it('should redact token fields', () => {
    const input = { token: 'abc123', accessToken: 'xyz789' };
    const result = sanitizeLogContext(input);

    expect(result).toEqual({ token: '[REDACTED]', accessToken: '[REDACTED]' });
    expect((result as Record<string, unknown>).token).toBe('[REDACTED]');
  });

  it('should redact authorization headers', () => {
    const input = { authorization: 'Bearer abc123', path: '/api' };
    const result = sanitizeLogContext(input);

    expect(result).toEqual({ authorization: '[REDACTED]', path: '/api' });
    expect((result as Record<string, unknown>).path).toBe('/api');
  });

  it('should handle deep nested objects', () => {
    const input = {
      user: {
        email: 'test@example.com',
        auth: { password: 'secret', token: 'abc' },
      },
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const user = result.user as Record<string, unknown>;
    const auth = user.auth as Record<string, unknown>;

    expect(auth.password).toBe('[REDACTED]');
    expect(auth.token).toBe('[REDACTED]');
    expect(user.email).toBe('test@example.com');
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

  it('should handle arrays inside objects', () => {
    const input = {
      users: [
        { password: 'secret', api_key: 'key123' },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const users = result.users as Array<Record<string, unknown>>;

    expect(users[0].password).toBe('[REDACTED]');
    expect(users[0].api_key).toBe('[REDACTED]');
  });

  it('should return null/undefined as-is', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should return primitives as-is', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should redact case-insensitively', () => {
    const input = { Password: 'secret', TOKEN: 'abc', Secret: 'key' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;

    expect(result.Password).toBe('[REDACTED]');
    expect(result.TOKEN).toBe('[REDACTED]');
    expect(result.Secret).toBe('[REDACTED]');
  });

  it('should redact access_token and refresh_token fields', () => {
    const input = { access_token: 'at123', refresh_token: 'rt456', username: 'test' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;

    expect(result.access_token).toBe('[REDACTED]');
    expect(result.refresh_token).toBe('[REDACTED]');
    expect(result.username).toBe('test');
  });

  it('should handle empty objects and arrays', () => {
    expect(sanitizeLogContext({})).toEqual({});
    expect(sanitizeLogContext([])).toEqual([]);
  });
});
