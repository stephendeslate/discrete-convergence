import { JwtAuthGuard } from './jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

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

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  const createMockContext = (): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    }) as unknown as ExecutionContext;

  it('should allow access for public routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const ctx = createMockContext();

    expect(guard.canActivate(ctx)).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
  });
});
