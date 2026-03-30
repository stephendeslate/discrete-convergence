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
} from '../src/index';

describe('shared constants', () => {
  it('should export BCRYPT_SALT_ROUNDS as 12', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
  });

  it('should export ALLOWED_REGISTRATION_ROLES', () => {
    expect(ALLOWED_REGISTRATION_ROLES).toContain('ADMIN');
    expect(ALLOWED_REGISTRATION_ROLES).toContain('DISPATCHER');
    expect(ALLOWED_REGISTRATION_ROLES).not.toContain('TECHNICIAN');
  });

  it('should export MAX_PAGE_SIZE as 100', () => {
    expect(MAX_PAGE_SIZE).toBe(100);
  });

  it('should export DEFAULT_PAGE_SIZE as 20', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(20);
  });

  it('should export APP_VERSION', () => {
    expect(APP_VERSION).toBe('1.0.0');
  });
});

describe('createCorrelationId', () => {
  it('should return a valid UUID', () => {
    const id = createCorrelationId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('should return unique values', () => {
    const ids = new Set(Array.from({ length: 10 }, () => createCorrelationId()));
    expect(ids.size).toBe(10);
  });
});

describe('formatLogEntry', () => {
  it('should format a log entry with level and message', () => {
    const entry = formatLogEntry('info', 'test message');
    expect(entry.level).toBe('info');
    expect(entry.message).toBe('test message');
    expect(entry.timestamp).toBeDefined();
  });

  it('should include sanitized context', () => {
    const entry = formatLogEntry('error', 'failed', {
      userId: 1,
      password: 'secret123',
    });
    expect(entry.userId).toBe(1);
    expect(entry.password).toBe('[REDACTED]');
  });
});

describe('sanitizeLogContext', () => {
  it('should redact sensitive keys', () => {
    const result = sanitizeLogContext({
      password: 'abc',
      token: 'xyz',
      userId: 42,
    });
    expect(result.password).toBe('[REDACTED]');
    expect(result.token).toBe('[REDACTED]');
    expect(result.userId).toBe(42);
  });

  it('should handle empty context', () => {
    const result = sanitizeLogContext({});
    expect(result).toEqual({});
  });

  it('should be case insensitive for sensitive keys', () => {
    const result = sanitizeLogContext({ Authorization: 'Bearer xyz' });
    expect(result.Authorization).toBe('[REDACTED]');
  });
});

describe('validateEnvVars', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should not throw when all vars are present', () => {
    process.env.TEST_VAR = 'value';
    expect(() => validateEnvVars(['TEST_VAR'])).not.toThrow();
  });

  it('should throw when vars are missing', () => {
    delete process.env.MISSING_VAR;
    expect(() => validateEnvVars(['MISSING_VAR'])).toThrow(
      'Missing required environment variables: MISSING_VAR',
    );
  });

  it('should throw when vars are empty strings', () => {
    process.env.EMPTY_VAR = '';
    expect(() => validateEnvVars(['EMPTY_VAR'])).toThrow(
      'Missing required environment variables: EMPTY_VAR',
    );
  });
});
