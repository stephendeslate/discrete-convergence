// Shared package unit tests
import {
  createCorrelationId,
  sanitizeLogContext,
  validateEnvVars,
  clampPagination,
  BCRYPT_SALT_ROUNDS,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  MIN_PAGE,
} from './index';

describe('shared utilities', () => {
  describe('createCorrelationId', () => {
    it('should return a UUID string', () => {
      const id = createCorrelationId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('should return unique values', () => {
      const ids = new Set(Array.from({ length: 100 }, () => createCorrelationId()));
      expect(ids.size).toBe(100);
    });
  });

  describe('sanitizeLogContext', () => {
    it('should redact sensitive fields', () => {
      const result = sanitizeLogContext({ password: 'secret', name: 'test' });
      expect(result.password).toBe('[REDACTED]');
      expect(result.name).toBe('test');
    });

    it('should redact token and authorization', () => {
      const result = sanitizeLogContext({ token: 'abc', authorization: 'Bearer x' });
      expect(result.token).toBe('[REDACTED]');
      expect(result.authorization).toBe('[REDACTED]');
    });
  });

  describe('validateEnvVars', () => {
    it('should not throw when all vars exist', () => {
      process.env.TEST_VAR_A = 'a';
      expect(() => validateEnvVars(['TEST_VAR_A'])).not.toThrow();
      delete process.env.TEST_VAR_A;
    });

    it('should throw when vars are missing', () => {
      expect(() => validateEnvVars(['MISSING_VAR_XYZ'])).toThrow('Missing required environment variables');
    });
  });

  describe('clampPagination', () => {
    it('should use defaults for empty params', () => {
      const result = clampPagination({});
      expect(result).toEqual({ page: MIN_PAGE, pageSize: DEFAULT_PAGE_SIZE });
    });

    it('should clamp page to minimum', () => {
      const result = clampPagination({ page: -5 });
      expect(result.page).toBe(MIN_PAGE);
    });

    it('should clamp pageSize to max', () => {
      const result = clampPagination({ pageSize: 500 });
      expect(result.pageSize).toBe(MAX_PAGE_SIZE);
    });
  });

  describe('constants', () => {
    it('should have correct salt rounds', () => {
      expect(BCRYPT_SALT_ROUNDS).toBe(12);
    });
  });
});
