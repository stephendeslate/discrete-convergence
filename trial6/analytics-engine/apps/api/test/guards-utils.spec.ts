// TRACED:AE-SEC-007 — Unit tests for guards, decorators, and utility functions
import { RolesGuard } from '../src/common/roles.guard';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { getTenantId, getUserId } from '../src/common/auth-utils';
import { parsePaginationParams } from '../src/common/pagination.utils';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

function createMockContext(user?: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard — comprehensive', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow when no roles required and user is any role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(createMockContext({ role: 'VIEWER' }))).toBe(true);
  });

  it('should allow when user role is in required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN', 'USER']);
    expect(guard.canActivate(createMockContext({ role: 'USER' }))).toBe(true);
  });

  it('should deny VIEWER trying ADMIN endpoint', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    expect(guard.canActivate(createMockContext({ role: 'VIEWER' }))).toBe(false);
  });

  it('should deny USER trying ADMIN-only endpoint', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    expect(guard.canActivate(createMockContext({ role: 'USER' }))).toBe(false);
  });

  it('should deny when user object is undefined', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['USER']);
    expect(guard.canActivate(createMockContext(undefined))).toBe(false);
  });

  it('should allow when required roles is empty array', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    expect(guard.canActivate(createMockContext({ role: 'VIEWER' }))).toBe(true);
  });

  it('should deny when user role is null', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    expect(guard.canActivate(createMockContext({ role: null }))).toBe(false);
  });
});

describe('JwtAuthGuard — public routes', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  it('should return true for @Public() decorated routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    expect(guard.canActivate(createMockContext())).toBe(true);
  });

  it('should consult reflector for IS_PUBLIC_KEY on every call', () => {
    const spy = jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    guard.canActivate(createMockContext());
    // Reflector was consulted to check if route is public
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('auth-utils', () => {
  describe('getTenantId', () => {
    it('should extract tenantId from req.user', () => {
      const req = { user: { tenantId: 'tenant-42', userId: 'u-1', role: 'ADMIN' } } as unknown as Request;
      expect(getTenantId(req)).toBe('tenant-42');
    });
  });

  describe('getUserId', () => {
    it('should extract userId from req.user', () => {
      const req = { user: { userId: 'user-99', tenantId: 't-1', role: 'USER' } } as unknown as Request;
      expect(getUserId(req)).toBe('user-99');
    });
  });
});

describe('parsePaginationParams — edge cases', () => {
  it('should parse valid numeric strings', () => {
    const result = parsePaginationParams('5', '50');
    expect(result.page).toBe(5);
    expect(result.limit).toBe(50);
  });

  it('should return undefined for missing params', () => {
    const result = parsePaginationParams(undefined, undefined);
    expect(result.page).toBeUndefined();
    expect(result.limit).toBeUndefined();
  });

  it('should handle only page provided', () => {
    const result = parsePaginationParams('3', undefined);
    expect(result.page).toBe(3);
    expect(result.limit).toBeUndefined();
  });

  it('should handle only limit provided', () => {
    const result = parsePaginationParams(undefined, '25');
    expect(result.page).toBeUndefined();
    expect(result.limit).toBe(25);
  });

  it('should return NaN for non-numeric strings', () => {
    const result = parsePaginationParams('abc', 'xyz');
    expect(Number.isNaN(result.page)).toBe(true);
    expect(Number.isNaN(result.limit)).toBe(true);
  });

  it('should handle zero as valid input', () => {
    const result = parsePaginationParams('0', '0');
    expect(result.page).toBe(0);
    expect(result.limit).toBe(0);
  });

  it('should handle negative numbers', () => {
    const result = parsePaginationParams('-1', '-10');
    expect(result.page).toBe(-1);
    expect(result.limit).toBe(-10);
  });

  it('should truncate floating point strings', () => {
    const result = parsePaginationParams('2.9', '10.5');
    // parseInt truncates at the decimal point
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
  });

  it('should handle empty string as falsy (returns undefined)', () => {
    const result = parsePaginationParams('', '');
    // Empty string is falsy, so ternary returns undefined
    expect(result.page).toBeUndefined();
    expect(result.limit).toBeUndefined();
  });
});
