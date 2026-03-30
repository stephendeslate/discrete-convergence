import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { username: 'admin', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.username).toBe('admin');
    expect(result.password).toBe('[REDACTED]');
  });

  it('should redact case-insensitive keys', () => {
    const input = { Password: 'x', TOKEN: 'y', Authorization: 'z' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Password).toBe('[REDACTED]');
    expect(result.TOKEN).toBe('[REDACTED]');
    expect(result.Authorization).toBe('[REDACTED]');
  });

  it('should handle nested objects recursively', () => {
    const input = { user: { name: 'test', passwordHash: 'abc' } };
    const result = sanitizeLogContext(input) as Record<string, Record<string, unknown>>;
    expect(result.user.name).toBe('test');
    expect(result.user.passwordHash).toBe('[REDACTED]');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { name: 'user1', accessToken: 'tok1' },
      { name: 'user2', secret: 'sec' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].name).toBe('user1');
    expect(result[0].accessToken).toBe('[REDACTED]');
    expect(result[1].secret).toBe('[REDACTED]');
  });

  it('should handle deeply nested arrays in objects', () => {
    const input = {
      data: {
        users: [
          { email: 'a@b.com', token: 'xyz' },
        ],
      },
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const data = result.data as Record<string, unknown>;
    const users = data.users as Array<Record<string, unknown>>;
    expect(users[0].email).toBe('a@b.com');
    expect(users[0].token).toBe('[REDACTED]');
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

  it('should redact all sensitive keys', () => {
    const input = {
      password: '1',
      passwordHash: '2',
      token: '3',
      accessToken: '4',
      secret: '5',
      authorization: '6',
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    for (const value of Object.values(result)) {
      expect(value).toBe('[REDACTED]');
    }
  });
});
