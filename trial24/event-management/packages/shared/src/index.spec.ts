// TRACED:SHARED-INDEX-SPEC
import {
  APP_VERSION,
  BCRYPT_SALT_ROUNDS,
  CORRELATION_ID_HEADER,
  createCorrelationId,
  sanitizeLogContext,
  validateEnvVars,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  MIN_PAGE,
  clampPagination,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
} from './index';

describe('shared package exports', () => {
  test('APP_VERSION is a semver string', () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('BCRYPT_SALT_ROUNDS is 12', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  test('JWT_ACCESS_EXPIRY is 15m', () => {
    expect(JWT_ACCESS_EXPIRY).toBe('15m');
  });

  test('JWT_REFRESH_EXPIRY is 7d', () => {
    expect(JWT_REFRESH_EXPIRY).toBe('7d');
  });

  test('CORRELATION_ID_HEADER is x-correlation-id', () => {
    expect(CORRELATION_ID_HEADER).toBe('x-correlation-id');
  });

  test('createCorrelationId returns a UUID', () => {
    const id = createCorrelationId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  test('createCorrelationId returns unique values', () => {
    const ids = new Set(Array.from({ length: 10 }, () => createCorrelationId()));
    expect(ids.size).toBe(10);
  });

  test('sanitizeLogContext redacts sensitive fields', () => {
    const input = { email: 'test@test.com', password: 'secret123', name: 'Test' };
    const result = sanitizeLogContext(input);
    expect(result.password).toBe('[REDACTED]');
    expect(result.email).toBe('test@test.com');
    expect(result.name).toBe('Test');
  });

  test('sanitizeLogContext handles nested objects', () => {
    const input = { user: { password: 'secret', name: 'Test' } };
    const result = sanitizeLogContext(input);
    expect((result.user as Record<string, unknown>).password).toBe('[REDACTED]');
    expect((result.user as Record<string, unknown>).name).toBe('Test');
  });

  test('validateEnvVars throws on missing vars', () => {
    expect(() => validateEnvVars(['DEFINITELY_NOT_SET_VAR_XYZ'])).toThrow(
      'Missing required environment variables: DEFINITELY_NOT_SET_VAR_XYZ',
    );
  });

  test('validateEnvVars does not throw when vars exist', () => {
    process.env.TEST_SHARED_VAR = 'exists';
    expect(() => validateEnvVars(['TEST_SHARED_VAR'])).not.toThrow();
    delete process.env.TEST_SHARED_VAR;
  });

  test('pagination constants are correct', () => {
    expect(MAX_PAGE_SIZE).toBe(100);
    expect(DEFAULT_PAGE_SIZE).toBe(20);
    expect(MIN_PAGE).toBe(1);
  });

  test('clampPagination uses defaults for undefined', () => {
    const result = clampPagination(undefined, undefined);
    expect(result).toEqual({ page: 1, pageSize: 20 });
  });

  test('clampPagination clamps page to minimum 1', () => {
    const result = clampPagination(-5, 10);
    expect(result).toEqual({ page: 1, pageSize: 10 });
  });

  test('clampPagination clamps pageSize to max 100', () => {
    const result = clampPagination(1, 500);
    expect(result).toEqual({ page: 1, pageSize: 100 });
  });

  test('clampPagination floors decimal values', () => {
    const result = clampPagination(2.7, 15.3);
    expect(result).toEqual({ page: 2, pageSize: 15 });
  });

  test('clampPagination handles NaN inputs', () => {
    const result = clampPagination(NaN, NaN);
    expect(result).toEqual({ page: 1, pageSize: 20 });
  });
});
