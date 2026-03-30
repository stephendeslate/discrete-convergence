// TRACED:AUTH-UTILS-SPEC
import { ForbiddenException } from '@nestjs/common';
import { requireRole, extractUser, RolesGuard } from './auth-utils';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('auth-utils', () => {
  describe('requireRole', () => {
    it('should pass when user has required role', () => {
      const user = { sub: 'u1', email: 'a@b.com', role: 'ADMIN', organizationId: 'o1' };
      expect(() => requireRole(user, 'ADMIN', 'VIEWER')).not.toThrow();
    });

    it('should throw ForbiddenException when user lacks required role (forbidden)', () => {
      const user = { sub: 'u1', email: 'a@b.com', role: 'VIEWER', organizationId: 'o1' };
      expect(() => requireRole(user, 'ADMIN')).toThrow(ForbiddenException);
    });
  });

  describe('extractUser', () => {
    it('should return user when valid', () => {
      const user = { sub: 'u1', email: 'a@b.com', role: 'ADMIN', organizationId: 'o1' };
      const result = extractUser({ user });
      expect(result.sub).toBe('u1');
      expect(result.email).toBe('a@b.com');
    });

    it('should throw ForbiddenException when user is null (unauthorized)', () => {
      expect(() => extractUser({})).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user has no sub (invalid)', () => {
      expect(() => extractUser({ user: { email: 'a@b.com' } })).toThrow(ForbiddenException);
    });
  });

  describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector();
      guard = new RolesGuard(reflector);
    });

    function createMockContext(user?: unknown): ExecutionContext {
      return {
        switchToHttp: () => ({
          getRequest: () => ({ user }),
          getResponse: () => ({}),
        }),
        getHandler: () => jest.fn(),
        getClass: () => jest.fn(),
      } as unknown as ExecutionContext;
    }

    it('should allow access when no roles required (empty)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const ctx = createMockContext({ sub: 'u1', role: 'VIEWER' });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should allow access when user has required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
      const ctx = createMockContext({ sub: 'u1', role: 'ADMIN', email: 'a@b.com', organizationId: 'o1' });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should throw ForbiddenException when no user context (unauthorized)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
      const ctx = createMockContext(undefined);
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user lacks role (forbidden)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
      const ctx = createMockContext({ sub: 'u1', role: 'VIEWER', email: 'a@b.com', organizationId: 'o1' });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });
  });
});
