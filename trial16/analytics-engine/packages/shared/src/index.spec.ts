import {
  BCRYPT_SALT_ROUNDS,
  ALLOWED_REGISTRATION_ROLES,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  APP_VERSION,
  createCorrelationId,
  formatLogEntry,
  sanitizeLogContext,
  validateEnvVars,
  parsePagination,
} from './index';

describe('shared constants', () => {
  it('should export correct BCRYPT_SALT_ROUNDS', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  it('should export ALLOWED_REGISTRATION_ROLES without ADMIN', () => {
    expect(ALLOWED_REGISTRATION_ROLES).toEqual(['VIEWER']);
    expect(ALLOWED_REGISTRATION_ROLES).not.toContain('ADMIN');
  });

  it('should export pagination constants', () => {
    expect(MAX_PAGE_SIZE).toBe(100);
    expect(DEFAULT_PAGE_SIZE).toBe(20);
  });

  it('should export APP_VERSION', () => {
    expect(APP_VERSION).toBeDefined();
    expect(typeof APP_VERSION).toBe('string');
  });
});

describe('createCorrelationId', () => {
  it('should return a UUID string', () => {
    const id = createCorrelationId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('should return unique IDs', () => {
    const id1 = createCorrelationId();
    const id2 = createCorrelationId();
    expect(id1).not.toBe(id2);
  });
});

describe('formatLogEntry', () => {
  it('should return valid JSON', () => {
    const entry = formatLogEntry({
      method: 'GET',
      url: '/health',
      statusCode: 200,
      duration: 5,
      correlationId: 'test-id',
    });
    const parsed = JSON.parse(entry);
    expect(parsed.method).toBe('GET');
    expect(parsed.url).toBe('/health');
    expect(parsed.statusCode).toBe(200);
    expect(parsed.correlationId).toBe('test-id');
  });
});

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const result = sanitizeLogContext({ password: 'secret123', email: 'a@b.com' });
    expect(result).toEqual({ password: '[REDACTED]', email: 'a@b.com' });
  });

  it('should redact nested sensitive fields', () => {
    const result = sanitizeLogContext({
      user: { passwordHash: 'hash', name: 'John' },
    });
    expect(result).toEqual({
      user: { passwordHash: '[REDACTED]', name: 'John' },
    });
  });

  it('should handle arrays recursively', () => {
    const result = sanitizeLogContext([
      { token: 'abc', id: 1 },
      { authorization: 'Bearer xyz', id: 2 },
    ]);
    expect(result).toEqual([
      { token: '[REDACTED]', id: 1 },
      { authorization: '[REDACTED]', id: 2 },
    ]);
  });

  it('should handle null and undefined', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should handle primitives', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
  });

  it('should redact access_token and secret', () => {
    const result = sanitizeLogContext({
      access_token: 'tok',
      secret: 'sec',
      data: 'ok',
    });
    expect(result).toEqual({
      access_token: '[REDACTED]',
      secret: '[REDACTED]',
      data: 'ok',
    });
  });
});

describe('validateEnvVars', () => {
  it('should throw for missing env vars', () => {
    expect(() => validateEnvVars(['NONEXISTENT_VAR_XYZ'])).toThrow(
      'Missing required environment variables',
    );
  });

  it('should not throw when vars are present', () => {
    process.env.TEST_VAR_EXISTS = 'value';
    expect(() => validateEnvVars(['TEST_VAR_EXISTS'])).not.toThrow();
    delete process.env.TEST_VAR_EXISTS;
  });
});

describe('parsePagination', () => {
  it('should return defaults when no params provided', () => {
    const result = parsePagination({});
    expect(result).toEqual({ page: 1, pageSize: 20, skip: 0 });
  });

  it('should clamp pageSize to MAX_PAGE_SIZE', () => {
    const result = parsePagination({ page: 1, pageSize: 500 });
    expect(result.pageSize).toBe(100);
  });

  it('should calculate skip correctly', () => {
    const result = parsePagination({ page: 3, pageSize: 10 });
    expect(result.skip).toBe(20);
  });

  it('should enforce minimum page of 1', () => {
    const result = parsePagination({ page: -5 });
    expect(result.page).toBe(1);
  });
});
