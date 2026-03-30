import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { username: 'admin', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.username).toBe('admin');
    expect(result.password).toBe('[REDACTED]');
  });

  it('should be case-insensitive', () => {
    const input = { Password: 'abc', TOKEN: 'xyz', Authorization: 'Bearer token' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Password).toBe('[REDACTED]');
    expect(result.TOKEN).toBe('[REDACTED]');
    expect(result.Authorization).toBe('[REDACTED]');
  });

  it('should handle deeply nested objects', () => {
    const input = {
      user: {
        profile: {
          name: 'Test',
          credentials: {
            passwordHash: 'hash123',
            secret: 'shh',
          },
        },
      },
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const credentials = (
      (result.user as Record<string, unknown>).profile as Record<string, unknown>
    ).credentials as Record<string, unknown>;
    expect(credentials.passwordHash).toBe('[REDACTED]');
    expect(credentials.secret).toBe('[REDACTED]');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { name: 'a', token: 'tok1' },
      { name: 'b', accessToken: 'tok2' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].name).toBe('a');
    expect(result[0].token).toBe('[REDACTED]');
    expect(result[1].name).toBe('b');
    expect(result[1].accessToken).toBe('[REDACTED]');
  });

  it('should handle arrays nested within objects', () => {
    const input = {
      users: [
        { name: 'Alice', apiKey: 'key1' },
        { name: 'Bob', refreshToken: 'rt1' },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const users = result.users as Array<Record<string, unknown>>;
    expect(users[0].apiKey).toBe('[REDACTED]');
    expect(users[1].refreshToken).toBe('[REDACTED]');
    expect(users[0].name).toBe('Alice');
  });

  it('should return null and undefined unchanged', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should return primitives unchanged', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should redact configEncrypted', () => {
    const input = { id: '1', configEncrypted: 'encrypted-data' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.configEncrypted).toBe('[REDACTED]');
    expect(result.id).toBe('1');
  });
});
