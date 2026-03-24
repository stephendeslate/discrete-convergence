import { describe, it, expect } from 'vitest';
import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { username: 'admin', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.username).toBe('admin');
    expect(result.password).toBe('[REDACTED]');
  });

  it('should redact case-insensitively', () => {
    const input = { Password: 'abc', TOKEN: 'xyz', Authorization: 'Bearer x' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.Password).toBe('[REDACTED]');
    expect(result.TOKEN).toBe('[REDACTED]');
    expect(result.Authorization).toBe('[REDACTED]');
  });

  it('should redact all sensitive keys', () => {
    const input = {
      password: 'a',
      passwordHash: 'b',
      token: 'c',
      accessToken: 'd',
      secret: 'e',
      authorization: 'f',
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    for (const value of Object.values(result)) {
      expect(value).toBe('[REDACTED]');
    }
  });

  it('should handle deep nested objects', () => {
    const input = {
      user: {
        profile: {
          name: 'John',
          auth: {
            password: 'deep-secret',
            token: 'deep-token',
          },
        },
      },
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const auth = (result.user as Record<string, unknown>);
    const profile = auth.profile as Record<string, unknown>;
    const authInner = profile.auth as Record<string, unknown>;
    expect(authInner.password).toBe('[REDACTED]');
    expect(authInner.token).toBe('[REDACTED]');
    expect(profile.name).toBe('John');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { username: 'a', password: 'secret1' },
      { username: 'b', token: 'secret2' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].username).toBe('a');
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[1].username).toBe('b');
    expect(result[1].token).toBe('[REDACTED]');
  });

  it('should handle arrays nested in objects', () => {
    const input = {
      users: [
        { name: 'Alice', secret: 'abc' },
        { name: 'Bob', authorization: 'Bearer xyz' },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const users = result.users as Array<Record<string, unknown>>;
    expect(users[0].name).toBe('Alice');
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
});
