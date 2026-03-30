import { JwtStrategy } from './jwt.strategy';
import { UserRole } from '@fleet-dispatch/shared';

jest.mock('@fleet-dispatch/shared', () => ({
  parsePagination: jest.fn().mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
  ALLOWED_REGISTRATION_ROLES: ['viewer', 'dispatcher'],
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 10,
  createCorrelationId: jest.fn(),
  formatLogEntry: jest.fn((e: unknown) => e),
  sanitizeLogContext: jest.fn((c: unknown) => c),
  validateEnvVars: jest.fn(),
  UserRole: { ADMIN: 'admin', VIEWER: 'viewer', DISPATCHER: 'dispatcher' },
}));

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    strategy = new JwtStrategy();
  });

  it('should validate and return JWT payload', () => {
    const payload = { sub: 'u-1', email: 'a@b.com', role: UserRole.ADMIN, tenantId: 't-1' };

    const result = strategy.validate(payload);

    expect(result).toEqual(payload);
    expect(result).toHaveProperty('sub', 'u-1');
    expect(result).toHaveProperty('tenantId', 't-1');
  });
});
