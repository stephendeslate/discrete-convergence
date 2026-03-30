import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { email: 'test@test.com', password: 'secret123' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ email: 'test@test.com', password: '[REDACTED]' });
    expect((result as Record<string, unknown>).password).toBe('[REDACTED]');
  });

  it('should redact token fields', () => {
    const input = { userId: '1', token: 'jwt-token-value' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ userId: '1', token: '[REDACTED]' });
    expect((result as Record<string, unknown>).token).toBe('[REDACTED]');
  });

  it('should redact authorization headers', () => {
    const input = { headers: { authorization: 'Bearer xyz' } };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.headers).toEqual({ authorization: '[REDACTED]' });
    expect((result.headers as Record<string, unknown>).authorization).toBe('[REDACTED]');
  });

  it('should redact accessToken fields', () => {
    const input = { accessToken: 'abc123', data: 'safe' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ accessToken: '[REDACTED]', data: 'safe' });
    expect((result as Record<string, unknown>).accessToken).toBe('[REDACTED]');
  });

  it('should redact secret fields', () => {
    const input = { secret: 'my-secret' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ secret: '[REDACTED]' });
    expect((result as Record<string, unknown>).secret).toBe('[REDACTED]');
  });

  it('should redact passwordHash fields', () => {
    const input = { passwordHash: '$2b$12$hash', name: 'test' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ passwordHash: '[REDACTED]', name: 'test' });
    expect((result as Record<string, unknown>).passwordHash).toBe('[REDACTED]');
  });

  it('should handle case-insensitive keys', () => {
    const input = { PASSWORD: 'secret', Token: 'jwt', Authorization: 'Bearer xyz' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({
      PASSWORD: '[REDACTED]',
      Token: '[REDACTED]',
      Authorization: '[REDACTED]',
    });
    expect(Object.values(result as Record<string, unknown>).every((v) => v === '[REDACTED]')).toBe(true);
  });

  it('should handle deeply nested objects', () => {
    const input = { level1: { level2: { password: 'deep-secret', safe: 'ok' } } };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const level2 = (result.level1 as Record<string, unknown>).level2 as Record<string, unknown>;
    expect(level2.password).toBe('[REDACTED]');
    expect(level2.safe).toBe('ok');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { password: 'secret1', name: 'user1' },
      { token: 'jwt1', name: 'user2' },
    ];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result).toHaveLength(2);
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[0].name).toBe('user1');
    expect(result[1].token).toBe('[REDACTED]');
    expect(result[1].name).toBe('user2');
  });

  it('should handle arrays nested inside objects', () => {
    const input = {
      users: [
        { password: 'secret', email: 'a@b.com' },
        { token: 'jwt', email: 'c@d.com' },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const users = result.users as Array<Record<string, unknown>>;
    expect(users[0].password).toBe('[REDACTED]');
    expect(users[0].email).toBe('a@b.com');
    expect(users[1].token).toBe('[REDACTED]');
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
});
