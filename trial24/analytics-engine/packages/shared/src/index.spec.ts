// TRACED:TEST-SHARED — Unit tests for shared package exports
import {
  APP_VERSION,
  BCRYPT_SALT_ROUNDS,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  MIN_PAGE,
  CORRELATION_ID_HEADER,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
  createCorrelationId,
  sanitizeLogContext,
  validateEnvVars,
  clampPagination,
} from './index';

describe('shared constants', () => {
  it('should export APP_VERSION', () => {
    expect(APP_VERSION).toBeDefined();
    expect(typeof APP_VERSION).toBe('string');
  });

  it('should have BCRYPT_SALT_ROUNDS = 12', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  it('should have sensible pagination defaults', () => {
    expect(MAX_PAGE_SIZE).toBeGreaterThan(0);
    expect(DEFAULT_PAGE_SIZE).toBeGreaterThan(0);
    expect(MIN_PAGE).toBe(1);
  });

  it('should define correlation header', () => {
    expect(CORRELATION_ID_HEADER).toBe('x-correlation-id');
  });

  it('should define JWT expiry times', () => {
    expect(JWT_ACCESS_EXPIRY).toBeDefined();
    expect(JWT_REFRESH_EXPIRY).toBeDefined();
  });
});

describe('createCorrelationId', () => {
  it('should generate unique IDs', () => {
    const id1 = createCorrelationId();
    const id2 = createCorrelationId();
    expect(id1).not.toBe(id2);
  });

  it('should return a string', () => {
    expect(typeof createCorrelationId()).toBe('string');
  });
});

describe('sanitizeLogContext', () => {
  it('should redact sensitive fields', () => {
    const result = sanitizeLogContext({ password: 'secret', name: 'test' });
    expect(result.password).toBe('[REDACTED]');
    expect(result.name).toBe('test');
  });

  it('should handle nested objects', () => {
    const result = sanitizeLogContext({ user: { token: 'abc' } });
    expect((result.user as Record<string, string>).token).toBe('[REDACTED]');
  });
});

describe('validateEnvVars', () => {
  it('should not throw when vars exist', () => {
    process.env.TEST_VAR_CHECK = 'value';
    expect(() => validateEnvVars(['TEST_VAR_CHECK'])).not.toThrow();
    delete process.env.TEST_VAR_CHECK;
  });

  it('should throw when required vars are missing', () => {
    expect(() => validateEnvVars(['NONEXISTENT_VAR_12345'])).toThrow();
  });
});

describe('clampPagination', () => {
  it('should return defaults when no params given', () => {
    const result = clampPagination();
    expect(result.page).toBe(1);
    expect(result.limit).toBe(DEFAULT_PAGE_SIZE);
  });

  it('should clamp page to minimum', () => {
    const result = clampPagination(0, 10);
    expect(result.page).toBe(1);
  });

  it('should clamp limit to max', () => {
    const result = clampPagination(1, 999);
    expect(result.limit).toBe(MAX_PAGE_SIZE);
  });

  it('should floor decimal values', () => {
    const result = clampPagination(1.7, 10.3);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });
});
