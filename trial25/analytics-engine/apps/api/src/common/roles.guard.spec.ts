// TRACED:RBAC-GUARD-TEST — Roles guard tests
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  function createContext(user: unknown): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('should allow when no roles required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createContext({ userId: '1', tenantId: 't1', email: 'a@b.com', role: 'VIEWER' });
    const result = guard.canActivate(context);
    expect(result).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(1);
  });

  it('should allow when empty roles array', () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    const context = createContext({ userId: '1', tenantId: 't1', email: 'a@b.com', role: 'VIEWER' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow when user has required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createContext({ userId: '1', tenantId: 't1', email: 'a@b.com', role: 'ADMIN' });
    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when user lacks role', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createContext({ userId: '1', tenantId: 't1', email: 'a@b.com', role: 'VIEWER' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('Insufficient permissions');
  });

  it('should throw ForbiddenException when no user on request', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    const context = createContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('Authentication required');
  });
});
