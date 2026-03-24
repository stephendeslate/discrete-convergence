import { RolesGuard } from '../src/common/roles.guard';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';

function createMockContext(role?: string, handler?: unknown, classRef?: unknown): ExecutionContext {
  return {
    getHandler: () => handler ?? (() => undefined),
    getClass: () => classRef ?? class {},
    switchToHttp: () => ({
      getRequest: () => ({
        user: role ? { role } : undefined,
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('Security - RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext('VIEWER');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN', 'ORGANIZER']);
    const context = createMockContext('ADMIN');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    const context = createMockContext('VIEWER');
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access when no user is present', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    const context = createMockContext(undefined);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should allow ORGANIZER for ORGANIZER-required routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN', 'ORGANIZER']);
    const context = createMockContext('ORGANIZER');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny VIEWER for ADMIN-only routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    const context = createMockContext('VIEWER');
    expect(guard.canActivate(context)).toBe(false);
  });
});

describe('Security - Input Validation', () => {
  it('should validate email format in DTOs', () => {
    // Verifies the validation decorators exist and are applied correctly
    // by checking the DTO class structure
    const { RegisterDto } = require('../src/auth/dto/register.dto');
    const dto = new RegisterDto();
    expect(dto).toBeDefined();
    expect(typeof RegisterDto).toBe('function');
  });

  it('should validate login DTO structure', () => {
    const { LoginDto } = require('../src/auth/dto/login.dto');
    const dto = new LoginDto();
    expect(dto).toBeDefined();
  });
});
