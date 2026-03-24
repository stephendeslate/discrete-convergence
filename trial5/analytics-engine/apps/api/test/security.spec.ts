import { RolesGuard } from '../src/common/roles.guard';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';

function createMockExecutionContext(user?: { role: string }): ExecutionContext {
  const mockRequest = { user };
  return {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('Security Guards', () => {
  describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector();
      guard = new RolesGuard(reflector);
    });

    it('should allow access when no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = createMockExecutionContext({ role: 'VIEWER' });

      // No @Roles() decorator means all authenticated users have access
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has matching role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN', 'USER']);
      const context = createMockExecutionContext({ role: 'ADMIN' });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access when user role does not match', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
      const context = createMockExecutionContext({ role: 'VIEWER' });

      // VIEWER trying to access ADMIN-only endpoint should be denied
      expect(guard.canActivate(context)).toBe(false);
    });

    it('should deny access when no user is present', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['USER']);
      const context = createMockExecutionContext(undefined);

      expect(guard.canActivate(context)).toBe(false);
    });
  });

  describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector();
      guard = new JwtAuthGuard(reflector);
    });

    it('should allow public routes to bypass authentication', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      const context = createMockExecutionContext();

      // @Public() decorated routes return true directly, skipping JWT check
      expect(guard.canActivate(context)).toBe(true);
    });
  });
});
