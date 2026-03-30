import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { email: 'user@test.com', password: 'secret123' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ email: 'user@test.com', password: '[REDACTED]' });
    expect((result as Record<string, unknown>).password).toBe('[REDACTED]');
  });

  it('should redact token fields', () => {
    const input = { token: 'jwt-token', data: 'safe' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ token: '[REDACTED]', data: 'safe' });
    expect((result as Record<string, unknown>).token).toBe('[REDACTED]');
  });

  it('should redact accessToken fields', () => {
    const input = { accessToken: 'abc123' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ accessToken: '[REDACTED]' });
    expect((result as Record<string, unknown>).accessToken).toBe('[REDACTED]');
  });

  it('should redact authorization fields', () => {
    const input = { authorization: 'Bearer xyz' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ authorization: '[REDACTED]' });
    expect((result as Record<string, unknown>).authorization).toBe('[REDACTED]');
  });

  it('should redact secret fields', () => {
    const input = { secret: 'top-secret', name: 'test' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ secret: '[REDACTED]', name: 'test' });
    expect((result as Record<string, unknown>).secret).toBe('[REDACTED]');
  });

  it('should handle case-insensitive keys', () => {
    const input = { PASSWORD: 'secret', Token: 'abc' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ PASSWORD: '[REDACTED]', Token: '[REDACTED]' });
    expect((result as Record<string, unknown>).PASSWORD).toBe('[REDACTED]');
  });

  it('should handle deep nested objects', () => {
    const input = {
      user: {
        profile: {
          password: 'deep-secret',
          name: 'John',
        },
      },
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const user = result.user as Record<string, unknown>;
    const profile = user.profile as Record<string, unknown>;
    expect(profile.password).toBe('[REDACTED]');
    expect(profile.name).toBe('John');
  });

  it('should handle arrays recursively', () => {
    const input = [
      { password: 'secret1', name: 'a' },
      { token: 'tok', name: 'b' },
    ];
    const result = sanitizeLogContext(input);
    expect(result).toEqual([
      { password: '[REDACTED]', name: 'a' },
      { token: '[REDACTED]', name: 'b' },
    ]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle arrays within objects', () => {
    const input = {
      users: [
        { password: 'p1' },
        { password: 'p2' },
      ],
    };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.users).toEqual([
      { password: '[REDACTED]' },
      { password: '[REDACTED]' },
    ]);
    expect(Array.isArray(result.users)).toBe(true);
  });

  it('should handle null and undefined', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should handle primitive values', () => {
    expect(sanitizeLogContext('string')).toBe('string');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should redact passwordHash fields', () => {
    const input = { passwordHash: '$2b$12$hash', email: 'a@b.com' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ passwordHash: '[REDACTED]', email: 'a@b.com' });
    expect((result as Record<string, unknown>).passwordHash).toBe('[REDACTED]');
  });

  it('should redact refreshToken fields', () => {
    const input = { refreshToken: 'refresh-token-value' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ refreshToken: '[REDACTED]' });
    expect((result as Record<string, unknown>).refreshToken).toBe('[REDACTED]');
  });

  it('should redact apiKey fields', () => {
    const input = { apiKey: 'key-123', name: 'test' };
    const result = sanitizeLogContext(input);
    expect(result).toEqual({ apiKey: '[REDACTED]', name: 'test' });
    expect((result as Record<string, unknown>).apiKey).toBe('[REDACTED]');
  });
});
