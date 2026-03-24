import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { sanitizeLogContext } from '@fleet-dispatch/shared';

function createMockContext(user?: { role: string }, handler?: object, cls?: object): ExecutionContext {
  return {
    getHandler: () => handler ?? {},
    getClass: () => cls ?? {},
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext({ role: 'DRIVER' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow when user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(['ADMIN', 'DISPATCHER']); // roles
    const context = createMockContext({ role: 'ADMIN' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny when user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(['ADMIN']); // roles
    const context = createMockContext({ role: 'DRIVER' });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny when no user is present', () => {
    jest.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(['ADMIN']); // roles
    const context = createMockContext(undefined);

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should allow public routes regardless of roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(true); // isPublic
    const context = createMockContext(undefined);

    expect(guard.canActivate(context)).toBe(true);
  });
});

describe('sanitizeLogContext', () => {
  it('should redact password fields', () => {
    const input = { email: 'test@test.com', password: 'secret123' };
    const result = sanitizeLogContext(input) as Record<string, unknown>;

    expect(result['password']).toBe('[REDACTED]');
    expect(result['email']).toBe('test@test.com');
  });

  it('should redact nested sensitive fields', () => {
    const input = { user: { token: 'abc', name: 'John' } };
    const result = sanitizeLogContext(input) as Record<string, Record<string, unknown>>;

    expect(result['user']['token']).toBe('[REDACTED]');
    expect(result['user']['name']).toBe('John');
  });

  it('should handle arrays', () => {
    const input = [{ password: 'x' }, { password: 'y' }];
    const result = sanitizeLogContext(input) as Array<Record<string, unknown>>;

    expect(result[0]['password']).toBe('[REDACTED]');
    expect(result[1]['password']).toBe('[REDACTED]');
  });

  it('should return null/undefined as-is', () => {
    expect(sanitizeLogContext(null)).toBeNull();
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('should return primitives as-is', () => {
    expect(sanitizeLogContext('hello')).toBe('hello');
    expect(sanitizeLogContext(42)).toBe(42);
  });
});
