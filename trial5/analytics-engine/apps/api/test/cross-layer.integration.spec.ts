// TRACED:AE-CROSS-002 — Cross-layer integration tests
import {
  BCRYPT_SALT_ROUNDS,
  ALLOWED_REGISTRATION_ROLES,
  APP_VERSION,
  clampPagination,
  createCorrelationId,
  formatLogEntry,
  sanitizeLogContext,
  validateEnvVars,
} from '@analytics-engine/shared';

describe('Cross-layer integration', () => {
  describe('Shared package exports', () => {
    it('should export all expected constants with correct types', () => {
      expect(typeof BCRYPT_SALT_ROUNDS).toBe('number');
      expect(Array.isArray(ALLOWED_REGISTRATION_ROLES)).toBe(true);
      expect(typeof APP_VERSION).toBe('string');
      expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should export all expected functions', () => {
      expect(typeof clampPagination).toBe('function');
      expect(typeof createCorrelationId).toBe('function');
      expect(typeof formatLogEntry).toBe('function');
      expect(typeof sanitizeLogContext).toBe('function');
      expect(typeof validateEnvVars).toBe('function');
    });
  });

  describe('Correlation ID generation', () => {
    it('should generate unique UUID v4 format IDs', () => {
      const id1 = createCorrelationId();
      const id2 = createCorrelationId();

      expect(id1).not.toBe(id2);
      // UUID v4 format: 8-4-4-4-12 hex characters
      expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });
  });

  describe('Log format integration', () => {
    it('should produce structured log entries with all fields', () => {
      const entry = formatLogEntry('info', 'test message', {
        method: 'GET',
        url: '/api/test',
        statusCode: 200,
        duration: 42,
        correlationId: 'test-id-123',
      });

      expect(entry.level).toBe('info');
      expect(entry.message).toBe('test message');
      expect(entry.method).toBe('GET');
      expect(entry.statusCode).toBe(200);
      expect(entry.correlationId).toBe('test-id-123');
      // Verify timestamp is automatically added
      expect(entry.timestamp).toBeDefined();
      expect(new Date(entry.timestamp).getTime()).not.toBeNaN();
    });
  });

  describe('Log sanitization integration', () => {
    it('should redact sensitive fields in nested request bodies', () => {
      const requestBody = {
        email: 'user@test.com',
        password: 'secret123',
        profile: {
          name: 'Test User',
          token: 'jwt-value',
        },
      };

      const sanitized = sanitizeLogContext(requestBody) as Record<string, unknown>;

      expect(sanitized['email']).toBe('user@test.com');
      expect(sanitized['password']).toBe('[REDACTED]');
      const profile = sanitized['profile'] as Record<string, unknown>;
      expect(profile['name']).toBe('Test User');
      expect(profile['token']).toBe('[REDACTED]');
    });
  });

  describe('Pagination integration', () => {
    it('should enforce bounds that prevent excessive database queries', () => {
      // Test that the shared clampPagination is used consistently
      const extreme = clampPagination(0, 999);
      expect(extreme.page).toBe(1); // min page
      expect(extreme.limit).toBe(100); // max limit

      const normal = clampPagination(3, 25);
      expect(normal.page).toBe(3);
      expect(normal.limit).toBe(25);

      // Verify skip calculation with clamped values
      const skip = (extreme.page - 1) * extreme.limit;
      expect(skip).toBe(0); // page 1 = skip 0
    });
  });

  describe('Environment validation', () => {
    it('should throw descriptive error listing all missing vars', () => {
      expect(() => validateEnvVars(['NONEXISTENT_VAR_1', 'NONEXISTENT_VAR_2']))
        .toThrow('Missing required environment variables: NONEXISTENT_VAR_1, NONEXISTENT_VAR_2');
    });

    it('should not throw when all vars are present', () => {
      // PATH is always present in Node.js
      expect(() => validateEnvVars(['PATH'])).not.toThrow();
    });
  });
});
