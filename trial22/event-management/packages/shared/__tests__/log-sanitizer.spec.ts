import { sanitizeLogContext, formatLogEntry, createCorrelationId, validateEnvVars, clampPagination, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '../src/index';

describe('sanitizeLogContext', () => {
  it('should redact password field', () => {
    const input = { email: 'test@example.com', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.password).toBe('[REDACTED]');
    expect(result.email).toBe('test@example.com');
  });

  it('should redact nested sensitive fields', () => {
    const input = { user: { name: 'Test', token: 'abc123', secret: 'xyz' } };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const user = result.user as Record<string, unknown>;
    expect(user.token).toBe('[REDACTED]');
    expect(user.secret).toBe('[REDACTED]');
    expect(user.name).toBe('Test');
  });

  it('should handle arrays recursively', () => {
    const input = [{ password: 'p1' }, { authorization: 'Bearer xyz' }];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;
    expect(result[0].password).toBe('[REDACTED]');
    expect(result[1].authorization).toBe('[REDACTED]');
  });

  it('should handle null and undefined', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should handle primitive values', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
  });

  it('should redact case-insensitively', () => {
    const input = { accessToken: 'token123', refreshToken: 'ref456' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    expect(result.accessToken).toBe('[REDACTED]');
    expect(result.refreshToken).toBe('[REDACTED]');
  });

  it('should handle deeply nested objects with arrays', () => {
    const input = { data: [{ nested: { passwordHash: 'hash' } }] };
    const result = sanitizeLogContext(input) as Record<string, unknown>;
    const data = result.data as Array<Record<string, unknown>>;
    const nested = data[0].nested as Record<string, unknown>;
    expect(nested.passwordHash).toBe('[REDACTED]');
  });
});

describe('formatLogEntry', () => {
  it('should format a complete log entry', () => {
    const entry = formatLogEntry({ level: 'error', message: 'fail', correlationId: 'abc' });
    expect(entry.level).toBe('error');
    expect(entry.message).toBe('fail');
    expect(entry.correlationId).toBe('abc');
  });

  it('should provide defaults for missing fields', () => {
    const entry = formatLogEntry({});
    expect(entry.level).toBe('info');
    expect(entry.message).toBe('');
    expect(entry.timestamp).toBeDefined();
  });
});

describe('createCorrelationId', () => {
  it('should return a UUID string', () => {
    const id = createCorrelationId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
});

describe('validateEnvVars', () => {
  it('should throw on missing env vars', () => {
    expect(() => validateEnvVars(['NONEXISTENT_VAR_XYZ'])).toThrow('Missing required environment variables');
  });

  it('should not throw when vars exist', () => {
    process.env.TEST_ENV_VAR_EXISTS = 'yes';
    expect(() => validateEnvVars(['TEST_ENV_VAR_EXISTS'])).not.toThrow();
    delete process.env.TEST_ENV_VAR_EXISTS;
  });
});

describe('clampPagination', () => {
  it('should clamp limit to MAX_PAGE_SIZE', () => {
    const result = clampPagination({ page: 1, limit: 999 });
    expect(result.limit).toBe(MAX_PAGE_SIZE);
    expect(result.page).toBe(1);
  });

  it('should use defaults when not provided', () => {
    const result = clampPagination({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(DEFAULT_PAGE_SIZE);
  });

  it('should clamp page to minimum 1', () => {
    const result = clampPagination({ page: -5, limit: 10 });
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });
});
