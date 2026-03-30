import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { username: 'admin', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.username).toBe('admin');
    expect(result.password).toBe('[REDACTED]');
  });

  it('should redact case-insensitively', () => {
    const input = { Password: 'secret', TOKEN: 'abc', Authorization: 'Bearer xyz' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Password).toBe('[REDACTED]');
    expect(result.TOKEN).toBe('[REDACTED]');
    expect(result.Authorization).toBe('[REDACTED]');
  });

  it('should handle deep nested objects', () => {
    const input = {
      user: {
        profile: {
          name: 'John',
          secret: 'top-secret',
        },
      },
    };
    const result = sanitizeLogContext(input) as Record<string, Record<string, Record<string, unknown>>>;
    expect(result.user.profile.name).toBe('John');
    expect(result.user.profile.secret).toBe('[REDACTED]');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { username: 'user1', password: 'pass1' },
      { username: 'user2', accessToken: 'token2' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].username).toBe('user1');
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[1].username).toBe('user2');
    expect(result[1].accessToken).toBe('[REDACTED]');
  });

  it('should handle arrays inside objects', () => {
    const input = {
      users: [
        { name: 'Alice', passwordHash: 'hash123' },
        { name: 'Bob', token: 'tok456' },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, Array<Record<string, unknown>>>;
    expect(result.users[0].name).toBe('Alice');
    expect(result.users[0].passwordHash).toBe('[REDACTED]');
    expect(result.users[1].token).toBe('[REDACTED]');
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

  it('should redact all sensitive keys', () => {
    const input = {
      password: 'a',
      passwordHash: 'b',
      token: 'c',
      accessToken: 'd',
      secret: 'e',
      authorization: 'f',
      safeField: 'g',
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.passwordHash).toBe('[REDACTED]');
    expect(result.token).toBe('[REDACTED]');
    expect(result.accessToken).toBe('[REDACTED]');
    expect(result.secret).toBe('[REDACTED]');
    expect(result.authorization).toBe('[REDACTED]');
    expect(result.safeField).toBe('g');
  });
});
