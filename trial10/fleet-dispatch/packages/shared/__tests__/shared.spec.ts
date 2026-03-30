import { BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, APP_VERSION, clampPagination, createCorrelationId, formatLogEntry, sanitizeLogContext, validateEnvVars } from '../src';

describe('Shared package', () => {
  describe('Constants', () => {
    it('BCRYPT_SALT_ROUNDS is 12', () => {
      expect(BCRYPT_SALT_ROUNDS).toBe(12);
      expect(typeof BCRYPT_SALT_ROUNDS).toBe('number');
    });

    it('ALLOWED_REGISTRATION_ROLES excludes ADMIN', () => {
      expect(ALLOWED_REGISTRATION_ROLES).toContain('DISPATCHER');
      expect(ALLOWED_REGISTRATION_ROLES).toContain('VIEWER');
      expect(ALLOWED_REGISTRATION_ROLES).not.toContain('ADMIN');
    });

    it('APP_VERSION is a semver string', () => {
      expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('clampPagination', () => {
    it('returns defaults when no args provided', () => {
      const result = clampPagination();
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('clamps page to minimum 1', () => {
      const result = clampPagination(-5, 10);
      expect(result.page).toBe(1);
    });

    it('clamps limit to MAX_PAGE_SIZE', () => {
      const result = clampPagination(1, 500);
      expect(result.limit).toBe(100);
    });

    it('floors fractional values', () => {
      const result = clampPagination(2.7, 15.3);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(15);
    });
  });

  describe('createCorrelationId', () => {
    it('returns a UUID string', () => {
      const id = createCorrelationId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('returns unique IDs on consecutive calls', () => {
      const id1 = createCorrelationId();
      const id2 = createCorrelationId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('formatLogEntry', () => {
    it('formats a basic log entry', () => {
      const entry = formatLogEntry('info', 'test message');
      expect(entry.level).toBe('info');
      expect(entry.message).toBe('test message');
      expect(entry.timestamp).toBeDefined();
    });

    it('includes context fields', () => {
      const entry = formatLogEntry('error', 'request failed', {
        method: 'GET',
        url: '/test',
        statusCode: 500,
        duration: 42,
        correlationId: 'abc-123',
      });
      expect(entry.method).toBe('GET');
      expect(entry.url).toBe('/test');
      expect(entry.statusCode).toBe(500);
      expect(entry.duration).toBe(42);
      expect(entry.correlationId).toBe('abc-123');
    });
  });

  describe('sanitizeLogContext', () => {
    it('redacts password fields', () => {
      const result = sanitizeLogContext({ password: 'secret123' });
      expect(result).toEqual({ password: '[REDACTED]' });
    });

    it('redacts case-insensitively', () => {
      const result = sanitizeLogContext({ Password: 'secret', TOKEN: 'abc' });
      expect(result).toEqual({ Password: '[REDACTED]', TOKEN: '[REDACTED]' });
    });

    it('redacts nested objects', () => {
      const result = sanitizeLogContext({
        user: { email: 'a@b.com', passwordHash: 'hash123' },
      });
      expect(result).toEqual({
        user: { email: 'a@b.com', passwordHash: '[REDACTED]' },
      });
    });

    it('redacts arrays of objects', () => {
      const result = sanitizeLogContext([
        { token: 'abc', name: 'test' },
        { secret: 'xyz', label: 'other' },
      ]);
      expect(result).toEqual([
        { token: '[REDACTED]', name: 'test' },
        { secret: '[REDACTED]', label: 'other' },
      ]);
    });

    it('handles null and undefined', () => {
      expect(sanitizeLogContext(null)).toBeNull();
      expect(sanitizeLogContext(undefined)).toBeUndefined();
    });

    it('passes through primitives', () => {
      expect(sanitizeLogContext('hello')).toBe('hello');
      expect(sanitizeLogContext(42)).toBe(42);
    });

    it('redacts authorization field', () => {
      const result = sanitizeLogContext({ authorization: 'Bearer token123' });
      expect(result).toEqual({ authorization: '[REDACTED]' });
    });

    it('redacts accessToken field', () => {
      const result = sanitizeLogContext({ accessToken: 'jwt.token.here' });
      expect(result).toEqual({ accessToken: '[REDACTED]' });
    });
  });

  describe('validateEnvVars', () => {
    it('does not throw when all vars are set', () => {
      process.env['TEST_VAR_1'] = 'value1';
      process.env['TEST_VAR_2'] = 'value2';
      expect(() => validateEnvVars(['TEST_VAR_1', 'TEST_VAR_2'])).not.toThrow();
      delete process.env['TEST_VAR_1'];
      delete process.env['TEST_VAR_2'];
    });

    it('throws when a var is missing', () => {
      expect(() => validateEnvVars(['NONEXISTENT_VAR_XYZ'])).toThrow(
        'Missing required environment variables: NONEXISTENT_VAR_XYZ',
      );
    });
  });
});
