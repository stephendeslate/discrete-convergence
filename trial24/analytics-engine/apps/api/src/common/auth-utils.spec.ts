// TRACED:AUTH-UTILS-SPEC
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { extractUser, RolesGuard } from './auth-utils';

describe('extractUser', () => {
  it('should return user when valid', () => {
    const req = { user: { sub: 'u-1', email: 'a@b.com', role: 'VIEWER', tenantId: 't-1' } };
    expect(extractUser(req)).toEqual(req.user);
  });

  it('should throw when user is missing', () => {
    expect(() => extractUser({})).toThrow('User not authenticated');
  });

  it('should throw when sub is missing', () => {
    expect(() => extractUser({ user: { email: 'a@b.com', tenantId: 't-1' } })).toThrow('User not authenticated');
  });

  it('should throw when tenantId is missing', () => {
    expect(() => extractUser({ user: { sub: 'u-1', email: 'a@b.com' } })).toThrow('User not authenticated');
  });
});

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function createContext(user?: unknown, roles?: string[]): ExecutionContext {
    const mockHandler = jest.fn();
    const mockClass = jest.fn();
    if (roles) {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(roles);
    } else {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    }
    return {
      getHandler: () => mockHandler,
      getClass: () => mockClass,
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow when no roles required', () => {
    const ctx = createContext({ sub: 'u-1', role: 'VIEWER', tenantId: 't-1' }, undefined);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow when empty roles array', () => {
    const ctx = createContext({ sub: 'u-1', role: 'VIEWER', tenantId: 't-1' }, []);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow when user has required role', () => {
    const ctx = createContext({ sub: 'u-1', role: 'ADMIN', tenantId: 't-1' }, ['ADMIN']);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw ForbiddenException when user lacks role', () => {
    const ctx = createContext({ sub: 'u-1', role: 'VIEWER', tenantId: 't-1' }, ['ADMIN']);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when no user context', () => {
    const ctx = createContext(undefined, ['ADMIN']);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
