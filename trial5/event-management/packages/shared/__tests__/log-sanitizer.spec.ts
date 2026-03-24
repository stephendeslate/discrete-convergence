// TRACED:EM-MON-005 — Unit tests for sanitizeLogContext including array cases
import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { username: 'admin', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result['password']).toBe('[REDACTED]');
    expect(result['username']).toBe('admin');
  });

  it('should redact token fields case-insensitively', () => {
    const input = { Token: 'abc123', AccessToken: 'xyz789' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result['Token']).toBe('[REDACTED]');
    expect(result['AccessToken']).toBe('[REDACTED]');
  });

  it('should redact authorization headers', () => {
    const input = { Authorization: 'Bearer xyz', data: 'safe' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result['Authorization']).toBe('[REDACTED]');
    expect(result['data']).toBe('safe');
  });

  it('should redact secret fields', () => {
    const input = { secret: 'top-secret', info: 'public' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result['secret']).toBe('[REDACTED]');
    expect(result['info']).toBe('public');
  });

  it('should redact passwordHash fields', () => {
    const input = { passwordHash: '$2b$12$...' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result['passwordHash']).toBe('[REDACTED]');
  });

  it('should handle deep nested objects', () => {
    const input = {
      user: {
        name: 'John',
        credentials: {
          password: 'secret',
          token: 'abc',
        },
      },
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const user = result['user'] as Record<string, unknown>;
    const creds = user['credentials'] as Record<string, unknown>;
    expect(creds['password']).toBe('[REDACTED]');
    expect(creds['token']).toBe('[REDACTED]');
    expect(user['name']).toBe('John');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { password: 'abc', name: 'Alice' },
      { token: 'xyz', role: 'admin' },
    ];
    const result = sanitizeLogContext(input) as Record<string, unknown>[];
    expect(result[0]['password']).toBe('[REDACTED]');
    expect(result[0]['name']).toBe('Alice');
    expect(result[1]['token']).toBe('[REDACTED]');
    expect(result[1]['role']).toBe('admin');
  });

  it('should handle arrays nested in objects', () => {
    const input = {
      users: [
        { password: 'secret1' },
        { password: 'secret2' },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const users = result['users'] as Record<string, unknown>[];
    expect(users[0]['password']).toBe('[REDACTED]');
    expect(users[1]['password']).toBe('[REDACTED]');
  });

  it('should return null for null input', () => {
    expect(sanitizeLogContext(null)).toBeNull();
  });

  it('should return undefined for undefined input', () => {
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should return primitives unchanged', () => {
    expect(sanitizeLogContext('string')).toBe('string');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });
});
