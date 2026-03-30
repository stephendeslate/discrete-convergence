// TRACED:SHARED-INDEX-SPEC
import {
  APP_VERSION,
  BCRYPT_SALT_ROUNDS,
  CORRELATION_ID_HEADER,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  MIN_PAGE,
  createCorrelationId,
  sanitizeLogContext,
  validateEnvVars,
  clampPagination,
} from './index';

describe('shared constants', () => {
  it('exports APP_VERSION', () => {
    expect(APP_VERSION).toBe('1.0.0');
  });

  it('exports BCRYPT_SALT_ROUNDS as 12', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  it('exports JWT expiry values', () => {
    expect(JWT_ACCESS_EXPIRY).toBe('15m');
    expect(JWT_REFRESH_EXPIRY).toBe('7d');
  });

  it('exports pagination constants', () => {
    expect(MAX_PAGE_SIZE).toBe(100);
    expect(DEFAULT_PAGE_SIZE).toBe(20);
    expect(MIN_PAGE).toBe(1);
  });

  it('exports CORRELATION_ID_HEADER', () => {
    expect(CORRELATION_ID_HEADER).toBe('x-correlation-id');
  });
});

describe('createCorrelationId', () => {
  it('returns a UUID string', () => {
    const id = createCorrelationId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('returns unique values', () => {
    const ids = new Set(Array.from({ length: 10 }, () => createCorrelationId()));
    expect(ids.size).toBe(10);
  });
});

describe('sanitizeLogContext', () => {
  it('redacts sensitive keys', () => {
    const result = sanitizeLogContext({
      email: 'test@example.com',
      password: 'secret123',
      token: 'jwt-token',
    });
    expect(result.email).toBe('test@example.com');
    expect(result.password).toBe('[REDACTED]');
    expect(result.token).toBe('[REDACTED]');
  });

  it('handles nested objects', () => {
    const result = sanitizeLogContext({
      user: { name: 'John', password: 'secret' },
    });
    expect((result.user as Record<string, unknown>).name).toBe('John');
    expect((result.user as Record<string, unknown>).password).toBe('[REDACTED]');
  });

  it('returns empty object for empty input', () => {
    expect(sanitizeLogContext({})).toEqual({});
  });
});

describe('validateEnvVars', () => {
  it('does not throw when all vars are present', () => {
    process.env.TEST_VAR_A = 'value';
    expect(() => validateEnvVars(['TEST_VAR_A'])).not.toThrow();
    delete process.env.TEST_VAR_A;
  });

  it('throws when vars are missing', () => {
    expect(() => validateEnvVars(['MISSING_VAR_XYZ'])).toThrow(
      'Missing required environment variables: MISSING_VAR_XYZ',
    );
  });
});

describe('clampPagination', () => {
  it('returns defaults when no args', () => {
    expect(clampPagination()).toEqual({ page: 1, limit: 20 });
  });

  it('clamps page to minimum 1', () => {
    expect(clampPagination(-5, 10)).toEqual({ page: 1, limit: 10 });
  });

  it('clamps limit to max 100', () => {
    expect(clampPagination(1, 500)).toEqual({ page: 1, limit: 100 });
  });

  it('parses string values', () => {
    expect(clampPagination('3', '25')).toEqual({ page: 3, limit: 25 });
  });

  it('handles NaN gracefully', () => {
    expect(clampPagination('abc', 'xyz')).toEqual({ page: 1, limit: 20 });
  });
});
