import { sanitizeLogContext } from '../src/log-sanitizer';

describe('sanitizeLogContext', () => {
  it('redacts password fields', () => {
    expect(sanitizeLogContext({ password: 'secret123' })).toEqual({ password: '[REDACTED]' });
  });

  it('redacts token fields', () => {
    expect(sanitizeLogContext({ token: 'abc' })).toEqual({ token: '[REDACTED]' });
  });

  it('preserves safe fields', () => {
    expect(sanitizeLogContext({ name: 'test', email: 'a@b.com' })).toEqual({ name: 'test', email: 'a@b.com' });
  });

  it('handles nested objects', () => {
    const result = sanitizeLogContext({ user: { password: 'x', name: 'y' } });
    expect(result).toEqual({ user: { password: '[REDACTED]', name: 'y' } });
  });

  it('handles arrays with objects', () => {
    const result = sanitizeLogContext({ items: [{ token: 'x' }, { name: 'y' }] });
    expect(result).toEqual({ items: [{ token: '[REDACTED]' }, { name: 'y' }] });
  });

  it('handles arrays with primitives', () => {
    expect(sanitizeLogContext({ tags: ['a', 'b'] })).toEqual({ tags: ['a', 'b'] });
  });

  it('handles empty objects', () => {
    expect(sanitizeLogContext({})).toEqual({});
  });

  it('handles deeply nested sensitive fields', () => {
    const result = sanitizeLogContext({ a: { b: { c: { secret: 'deep' } } } });
    expect(result).toEqual({ a: { b: { c: { secret: '[REDACTED]' } } } });
  });
});
