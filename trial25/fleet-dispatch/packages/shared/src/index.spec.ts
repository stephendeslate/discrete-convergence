import {
  APP_VERSION,
  BCRYPT_SALT_ROUNDS,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  MIN_PAGE,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
  CORRELATION_ID_HEADER,
  buildPaginatedResponse,
  clampPage,
  clampPageSize,
  sanitizeString,
  sanitizeLogData,
  isValidCorrelationId,
} from './index';

describe('Shared constants', () => {
  it('should export APP_VERSION', () => {
    expect(APP_VERSION).toBe('1.0.0');
  });

  it('should have correct bcrypt salt rounds', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  it('should have correct pagination defaults', () => {
    expect(MAX_PAGE_SIZE).toBe(100);
    expect(DEFAULT_PAGE_SIZE).toBe(20);
    expect(MIN_PAGE).toBe(1);
  });

  it('should have JWT expiry values', () => {
    expect(JWT_ACCESS_EXPIRY).toBe('15m');
    expect(JWT_REFRESH_EXPIRY).toBe('7d');
  });

  it('should have correlation ID header', () => {
    expect(CORRELATION_ID_HEADER).toBe('x-correlation-id');
  });
});

describe('buildPaginatedResponse', () => {
  it('should build a paginated response', () => {
    const result = buildPaginatedResponse(['a', 'b'], 10, { page: 1, pageSize: 2 });
    expect(result.meta.totalPages).toBe(5);
    expect(result.data).toHaveLength(2);
  });

  it('should handle empty data', () => {
    const result = buildPaginatedResponse([], 0, { page: 1, pageSize: 10 });
    expect(result.data).toHaveLength(0);
    expect(result.meta.totalPages).toBe(0);
  });
});

describe('clampPage', () => {
  it('should clamp page to minimum 1', () => {
    expect(clampPage(0)).toBe(1);
    expect(clampPage(-5)).toBe(1);
    expect(clampPage(3)).toBe(3);
  });
});

describe('clampPageSize', () => {
  it('should clamp page size within bounds', () => {
    expect(clampPageSize(0)).toBe(1);
    expect(clampPageSize(200)).toBe(100);
    expect(clampPageSize(50)).toBe(50);
  });
});

describe('sanitizeString', () => {
  it('should strip angle brackets and trim', () => {
    expect(sanitizeString('  <script>alert</script>  ')).toBe('scriptalert/script');
  });
});

describe('sanitizeLogData', () => {
  it('should redact sensitive keys', () => {
    const result = sanitizeLogData({ password: 'secret', name: 'test' });
    expect(result.password).toBe('[REDACTED]');
    expect(result.name).toBe('test');
  });

  it('should handle nested objects', () => {
    const result = sanitizeLogData({ user: { token: 'abc', email: 'a@b.com' } });
    expect((result.user as Record<string, unknown>).token).toBe('[REDACTED]');
    expect((result.user as Record<string, unknown>).email).toBe('a@b.com');
  });
});

describe('isValidCorrelationId', () => {
  it('should validate correct IDs', () => {
    expect(isValidCorrelationId('abc-123_def')).toBe(true);
  });

  it('should reject empty strings', () => {
    expect(isValidCorrelationId('')).toBe(false);
  });

  it('should reject strings with special chars', () => {
    expect(isValidCorrelationId('<script>')).toBe(false);
  });
});
