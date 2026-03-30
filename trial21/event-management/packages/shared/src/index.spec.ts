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
} from './index';

describe('shared constants', () => {
  it('should export BCRYPT_SALT_ROUNDS as 12', () => {
    expect(BCRYPT_SALT_ROUNDS).toBe(12);
    expect(typeof BCRYPT_SALT_ROUNDS).toBe('number');
  });

  it('should export ALLOWED_REGISTRATION_ROLES with ATTENDEE', () => {
    expect(ALLOWED_REGISTRATION_ROLES).toContain('ATTENDEE');
    expect(ALLOWED_REGISTRATION_ROLES).toHaveLength(1);
  });

  it('should export MAX_PAGE_SIZE as 100', () => {
    expect(MAX_PAGE_SIZE).toBe(100);
  });

  it('should export DEFAULT_PAGE_SIZE as 20', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(20);
  });

  it('should export APP_VERSION as semver string', () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe('createCorrelationId', () => {
  it('should return a string prefixed with em-', () => {
    const id = createCorrelationId();
    expect(id).toMatch(/^em-/);
    expect(typeof id).toBe('string');
  });

  it('should return unique values on each call', () => {
    const id1 = createCorrelationId();
    const id2 = createCorrelationId();
    expect(id1).not.toBe(id2);
  });
});

describe('formatLogEntry', () => {
  it('should include level, message, and timestamp', () => {
    const entry = formatLogEntry('info', 'test message');
    expect(entry.level).toBe('info');
    expect(entry.message).toBe('test message');
    expect(entry.timestamp).toBeDefined();
  });

  it('should include sanitized context', () => {
    const entry = formatLogEntry('warn', 'auth', { userId: '123', password: 'secret' });
    expect(entry.userId).toBe('123');
    expect(entry.password).toBe('[REDACTED]');
  });
});

describe('sanitizeLogContext', () => {
  it('should redact sensitive keys', () => {
    const result = sanitizeLogContext({
      token: 'abc',
      secret: 'xyz',
      authorization: 'Bearer xxx',
      cookie: 'session=abc',
      safe: 'value',
    });
    expect(result.token).toBe('[REDACTED]');
    expect(result.secret).toBe('[REDACTED]');
    expect(result.authorization).toBe('[REDACTED]');
    expect(result.cookie).toBe('[REDACTED]');
    expect(result.safe).toBe('value');
  });

  it('should handle empty context', () => {
    const result = sanitizeLogContext({});
    expect(Object.keys(result)).toHaveLength(0);
  });
});

describe('validateEnvVars', () => {
  it('should not throw when all vars are set', () => {
    process.env.TEST_VAR_A = 'a';
    process.env.TEST_VAR_B = 'b';
    expect(() => validateEnvVars(['TEST_VAR_A', 'TEST_VAR_B'])).not.toThrow();
    delete process.env.TEST_VAR_A;
    delete process.env.TEST_VAR_B;
  });

  it('should throw when a var is missing', () => {
    expect(() => validateEnvVars(['NONEXISTENT_VAR_XYZ'])).toThrow(
      'Missing required environment variables: NONEXISTENT_VAR_XYZ',
    );
  });

  it('should throw when a var is empty string', () => {
    process.env.EMPTY_VAR = '';
    expect(() => validateEnvVars(['EMPTY_VAR'])).toThrow('Missing required environment variables');
    delete process.env.EMPTY_VAR;
  });
});
