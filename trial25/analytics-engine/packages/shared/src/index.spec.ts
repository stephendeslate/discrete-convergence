// TRACED:SHARED-INDEX-TEST — Shared package index tests
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

describe('Shared Package Exports', () => {
  it('exports APP_VERSION', () => {
    expect(APP_VERSION).toBe('1.0.0');
  });

  it('exports BCRYPT_SALT_ROUNDS', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  it('exports MAX_PAGE_SIZE', () => {
    expect(MAX_PAGE_SIZE).toBe(100);
  });

  it('exports DEFAULT_PAGE_SIZE', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(20);
  });

  it('exports MIN_PAGE', () => {
    expect(MIN_PAGE).toBe(1);
  });

  it('exports CORRELATION_ID_HEADER', () => {
    expect(CORRELATION_ID_HEADER).toBe('x-correlation-id');
  });

  it('exports JWT_ACCESS_EXPIRY', () => {
    expect(JWT_ACCESS_EXPIRY).toBe('15m');
  });

  it('exports JWT_REFRESH_EXPIRY', () => {
    expect(JWT_REFRESH_EXPIRY).toBe('7d');
  });

  it('exports createCorrelationId function', () => {
    const id = createCorrelationId();
    expect(typeof id).toBe('string');
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('exports sanitizeLogContext function', () => {
    const result = sanitizeLogContext({ authorization: 'Bearer xxx', name: 'test' });
    expect((result as Record<string, string>).authorization).toBe('[REDACTED]');
    expect((result as Record<string, string>).name).toBe('test');
  });

  it('sanitizeLogContext handles null and arrays', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
    const arr = sanitizeLogContext([{ password: 'x' }]);
    expect((arr as Array<Record<string, string>>)[0].password).toBe('[REDACTED]');
  });

  it('exports validateEnvVars function', () => {
    expect(() => validateEnvVars(['NONEXISTENT_VAR_FOR_TEST'])).toThrow('Missing required environment variables');
  });

  it('validateEnvVars passes with existing vars', () => {
    process.env['TEST_SHARED_VAR'] = 'ok';
    expect(() => validateEnvVars(['TEST_SHARED_VAR'])).not.toThrow();
    delete process.env['TEST_SHARED_VAR'];
  });

  it('exports clampPagination function', () => {
    const result = clampPagination(2, 50);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(50);
    expect(result.skip).toBe(50);
  });

  it('clampPagination clamps to MAX_PAGE_SIZE', () => {
    const result = clampPagination(1, 500);
    expect(result.limit).toBe(100);
  });

  it('clampPagination uses defaults', () => {
    const result = clampPagination();
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.skip).toBe(0);
  });
});
