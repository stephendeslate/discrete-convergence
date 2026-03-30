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
  });

  it('should not include ADMIN in ALLOWED_REGISTRATION_ROLES', () => {
    expect(ALLOWED_REGISTRATION_ROLES).not.toContain('ADMIN');
  });

  it('should include USER and VIEWER in ALLOWED_REGISTRATION_ROLES', () => {
    expect(ALLOWED_REGISTRATION_ROLES).toContain('USER');
    expect(ALLOWED_REGISTRATION_ROLES).toContain('VIEWER');
  });

  it('should export MAX_PAGE_SIZE as 100', () => {
    expect(MAX_PAGE_SIZE).toBe(100);
  });

  it('should export DEFAULT_PAGE_SIZE as 20', () => {
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
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('should return unique IDs', () => {
    const id1 = createCorrelationId();
    const id2 = createCorrelationId();
    expect(id1).not.toBe(id2);
  });
});

describe('formatLogEntry', () => {
  it('should format a log entry with level and message', () => {
    const entry = formatLogEntry('info', 'test message');
    expect(entry).toHaveProperty('level', 'info');
    expect(entry).toHaveProperty('message', 'test message');
    expect(entry).toHaveProperty('timestamp');
  });

  it('should include sanitized context', () => {
    const entry = formatLogEntry('warn', 'warning', { userId: '123', password: 'secret' });
    expect(entry).toHaveProperty('userId', '123');
    expect(entry).toHaveProperty('password', '[REDACTED]');
  });
});

describe('sanitizeLogContext', () => {
  it('should redact sensitive fields', () => {
    const result = sanitizeLogContext({
      password: 'mypass',
      token: 'mytoken',
      secret: 'mysecret',
      authorization: 'Bearer abc',
      cookie: 'session=xyz',
      apiKey: 'key123',
      username: 'testuser',
    });
    expect(result.password).toBe('[REDACTED]');
    expect(result.token).toBe('[REDACTED]');
    expect(result.secret).toBe('[REDACTED]');
    expect(result.authorization).toBe('[REDACTED]');
    expect(result.cookie).toBe('[REDACTED]');
    expect(result.apiKey).toBe('[REDACTED]');
    expect(result.username).toBe('testuser');
  });

  it('should return empty object for empty input', () => {
    expect(sanitizeLogContext({})).toEqual({});
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

  it('should not throw when all variables are present', () => {
    process.env['DATABASE_URL'] = 'postgres://localhost';
    process.env['JWT_SECRET'] = 'secret';
    expect(() => validateEnvVars(['DATABASE_URL', 'JWT_SECRET'])).not.toThrow();
  });

  it('should throw when variables are missing', () => {
    delete process.env['MISSING_VAR'];
    expect(() => validateEnvVars(['MISSING_VAR'])).toThrow('Missing required environment variables: MISSING_VAR');
  });

  it('should list all missing variables', () => {
    delete process.env['VAR_A'];
    delete process.env['VAR_B'];
    expect(() => validateEnvVars(['VAR_A', 'VAR_B'])).toThrow('Missing required environment variables: VAR_A, VAR_B');
  });
});
