import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
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

  it('should redact sensitive keys (case-insensitive)', () => {
    const input = { password: 'secret123', email: 'user@test.com' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result['password']).toBe('[REDACTED]');
    expect(result['email']).toBe('user@test.com');
  });

  it('should redact passwordHash field', () => {
    const input = { passwordHash: '$2b$12$...' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result['passwordHash']).toBe('[REDACTED]');
  });

  it('should redact token field', () => {
    const input = { token: 'jwt-token-value' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result['token']).toBe('[REDACTED]');
  });

  it('should redact accessToken field', () => {
    const input = { accessToken: 'bearer-value' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result['accessToken']).toBe('[REDACTED]');
  });

  it('should redact secret field', () => {
    const input = { secret: 'my-secret' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result['secret']).toBe('[REDACTED]');
  });

  it('should redact authorization field', () => {
    const input = { authorization: 'Bearer xyz' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result['authorization']).toBe('[REDACTED]');
  });

  it('should handle deep nested objects', () => {
    const input = { user: { profile: { password: 'nested-secret', name: 'John' } } };
    const result = sanitizeLogContext(input) as Record<string, Record<string, Record<string, unknown>>>;
    expect(result['user']['profile']['password']).toBe('[REDACTED]');
    expect(result['user']['profile']['name']).toBe('John');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { password: 'secret1', name: 'User1' },
      { password: 'secret2', name: 'User2' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result).toHaveLength(2);
    expect(result[0]['password']).toBe('[REDACTED]');
    expect(result[0]['name']).toBe('User1');
    expect(result[1]['password']).toBe('[REDACTED]');
    expect(result[1]['name']).toBe('User2');
  });

  it('should handle arrays with nested objects', () => {
    const input = { users: [{ token: 'abc', id: '1' }, { token: 'def', id: '2' }] };
    const result = sanitizeLogContext(input) as Record<string, Array<Record<string, unknown>>>;
    expect(result['users'][0]['token']).toBe('[REDACTED]');
    expect(result['users'][0]['id']).toBe('1');
    expect(result['users'][1]['token']).toBe('[REDACTED]');
  });

  it('should handle mixed arrays of primitives and objects', () => {
    const input = ['hello', { password: 'secret' }, 42, null];
    const result = sanitizeLogContext(input) as unknown[];
    expect(result[0]).toBe('hello');
    expect((result[1] as Record<string, unknown>)['password']).toBe('[REDACTED]');
    expect(result[2]).toBe(42);
    expect(result[3]).toBeNull();
  });
});
