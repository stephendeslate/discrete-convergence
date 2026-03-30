import { createCorrelationId, sanitizeLogContext, formatLogEntry, APP_VERSION } from '@event-management/shared';

describe('Cross-Layer Integration', () => {
  describe('Correlation ID', () => {
    it('should generate unique UUIDs', () => {
      const id1 = createCorrelationId();
      const id2 = createCorrelationId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });
  });

  describe('Log Sanitization', () => {
    it('should redact password field', () => {
      const result = sanitizeLogContext({ password: 'secret123', email: 'test@test.com' });
      expect(result).toEqual({ password: '[REDACTED]', email: 'test@test.com' });
    });

    it('should redact nested sensitive fields', () => {
      const result = sanitizeLogContext({
        user: { name: 'Alice', token: 'abc123' },
        data: 'safe',
      });
      const typed = result as Record<string, unknown>;
      const user = typed['user'] as Record<string, unknown>;
      expect(user['token']).toBe('[REDACTED]');
      expect(user['name']).toBe('Alice');
    });

    it('should handle arrays with sensitive data', () => {
      const result = sanitizeLogContext([
        { password: 'secret' },
        { name: 'visible' },
      ]);
      const arr = result as Array<Record<string, unknown>>;
      expect(arr[0]!['password']).toBe('[REDACTED]');
      expect(arr[1]!['name']).toBe('visible');
    });

    it('should handle null and undefined', () => {
      expect(sanitizeLogContext(null)).toBeNull();
      expect(sanitizeLogContext(undefined)).toBeUndefined();
    });

    it('should handle primitive values', () => {
      expect(sanitizeLogContext('hello')).toBe('hello');
      expect(sanitizeLogContext(42)).toBe(42);
    });
  });

  describe('Log Formatting', () => {
    it('should produce valid JSON with timestamp', () => {
      const entry = formatLogEntry({ level: 'info', message: 'test' });
      const parsed = JSON.parse(entry) as Record<string, unknown>;
      expect(parsed['level']).toBe('info');
      expect(parsed['message']).toBe('test');
      expect(typeof parsed['timestamp']).toBe('string');
    });

    it('should include optional fields when provided', () => {
      const entry = formatLogEntry({
        level: 'info',
        message: 'HTTP Request',
        method: 'GET',
        url: '/api/events',
        statusCode: 200,
        duration: 42,
        correlationId: 'test-id',
      });
      const parsed = JSON.parse(entry) as Record<string, unknown>;
      expect(parsed['method']).toBe('GET');
      expect(parsed['statusCode']).toBe(200);
      expect(parsed['duration']).toBe(42);
      expect(parsed['correlationId']).toBe('test-id');
    });
  });

  describe('Shared Constants', () => {
    it('should export APP_VERSION as semver string', () => {
      expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });
});
