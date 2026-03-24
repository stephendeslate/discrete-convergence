import { describe, it, expect } from 'vitest';
import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('redacts password fields', () => {
    const result = sanitizeLogContext({ password: 'secret123', email: 'a@b.com' });
    expect(result).toEqual({ password: '[REDACTED]', email: 'a@b.com' });
  });

  it('is case-insensitive', () => {
    const result = sanitizeLogContext({ PASSWORD: 'x', Token: 'y', Authorization: 'z' });
    expect(result).toEqual({ PASSWORD: '[REDACTED]', Token: '[REDACTED]', Authorization: '[REDACTED]' });
  });

  it('handles deep nesting', () => {
    const result = sanitizeLogContext({ user: { password: 'x', name: 'Jo' } });
    expect(result).toEqual({ user: { password: '[REDACTED]', name: 'Jo' } });
  });

  it('handles arrays', () => {
    const result = sanitizeLogContext([{ token: 'abc' }, { name: 'ok' }]);
    expect(result).toEqual([{ token: '[REDACTED]' }, { name: 'ok' }]);
  });

  it('returns primitives unchanged', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
    expect(sanitizeLogContext(null)).toBe(null);
    expect(sanitizeLogContext(undefined)).toBe(undefined);
  });

  it('redacts api_key and credit_card', () => {
    const result = sanitizeLogContext({ api_key: 'k', creditCard: '4111' });
    expect(result).toEqual({ api_key: '[REDACTED]', creditCard: '[REDACTED]' });
  });
});
