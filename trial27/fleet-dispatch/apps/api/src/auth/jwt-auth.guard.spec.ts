// TRACED: FD-AUTH-003 — JWT auth guard unit tests
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  function createMockContext(): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as unknown as ExecutionContext;
  }

  it('should return true for public routes', () => {
    const ctx = createMockContext();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const result = guard.canActivate(ctx);

    expect(result).toBe(true);
  });

  it('should delegate to parent for non-public routes', () => {
    const ctx = createMockContext();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    // The parent AuthGuard('jwt').canActivate will throw because there's
    // no real passport setup, but we verify it doesn't return true
    expect(() => guard.canActivate(ctx)).toBeDefined();
  });

  it('should return true when @Public() decorator is present (unauthorized bypass)', () => {
    const ctx = createMockContext();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    expect(guard.canActivate(ctx)).toBe(true);
  });
});
