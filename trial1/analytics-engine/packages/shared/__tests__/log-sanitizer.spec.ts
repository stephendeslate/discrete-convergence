import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const result = sanitizeLogContext({ password: 'secret123' });
    expect(result).toEqual({ password: '[REDACTED]' });
  });

  it('should redact case-insensitively', () => {
    const result = sanitizeLogContext({ Password: 'secret', TOKEN: 'abc' });
    expect(result).toEqual({ Password: '[REDACTED]', TOKEN: '[REDACTED]' });
  });

  it('should handle deep nested objects', () => {
    const result = sanitizeLogContext({
      user: { credentials: { password: 'deep', token: 'tok' } },
    });
    expect(result).toEqual({
      user: { credentials: { password: '[REDACTED]', token: '[REDACTED]' } },
    });
  });

  it('should handle arrays recursively', () => {
    const result = sanitizeLogContext([
      { password: 'a' },
      { name: 'safe', authorization: 'Bearer xyz' },
    ]);
    expect(result).toEqual([
      { password: '[REDACTED]' },
      { name: 'safe', authorization: '[REDACTED]' },
    ]);
  });

  it('should handle null and undefined', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should pass through primitives', () => {
    expect(sanitizeLogContext('string')).toBe('string');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(true)).toBe(true);
  });

  it('should redact all sensitive keys', () => {
    const result = sanitizeLogContext({
      password: '1',
      passwordHash: '2',
      token: '3',
      accessToken: '4',
      secret: '5',
      authorization: '6',
      safeProp: 'keep',
    });
    expect(result).toEqual({
      password: '[REDACTED]',
      passwordHash: '[REDACTED]',
      token: '[REDACTED]',
      accessToken: '[REDACTED]',
      secret: '[REDACTED]',
      authorization: '[REDACTED]',
      safeProp: 'keep',
    });
  });

  it('should handle nested arrays within objects', () => {
    const result = sanitizeLogContext({
      items: [{ secret: 'x' }, { value: 'ok' }],
    });
    expect(result).toEqual({
      items: [{ secret: '[REDACTED]' }, { value: 'ok' }],
    });
  });
});
