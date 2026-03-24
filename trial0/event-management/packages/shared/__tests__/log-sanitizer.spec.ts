import { describe, it, expect } from 'vitest';
import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const result = sanitizeLogContext({ password: 'secret123' });
    expect(result).toEqual({ password: '[REDACTED]' });
  });

  it('should be case-insensitive', () => {
    const result = sanitizeLogContext({ Password: 'secret', TOKEN: 'abc' });
    expect(result).toEqual({ Password: '[REDACTED]', TOKEN: '[REDACTED]' });
  });

  it('should handle deep nested objects', () => {
    const result = sanitizeLogContext({
      user: { name: 'John', credentials: { password: 'x', token: 'y' } },
    });
    expect(result).toEqual({
      user: { name: 'John', credentials: { password: '[REDACTED]', token: '[REDACTED]' } },
    });
  });

  it('should handle arrays', () => {
    const result = sanitizeLogContext([{ password: 'a' }, { name: 'b' }]);
    expect(result).toEqual([{ password: '[REDACTED]' }, { name: 'b' }]);
  });

  it('should return primitives as-is', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(null)).toBe(null);
    expect(sanitizeLogContext(undefined)).toBe(undefined);
  });
});
