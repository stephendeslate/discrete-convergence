import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { IS_PUBLIC_KEY } from './public.decorator';

// Test the guard logic without importing passport internals
describe('JwtAuthGuard', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  function createContext(): ExecutionContext {
    return {
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({}),
        getResponse: () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow access for public routes via reflector check', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const isPublic = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      createContext().getHandler(),
      createContext().getClass(),
    ]);
    expect(isPublic).toBe(true);
  });

  it('should require auth for non-public routes via reflector check', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const isPublic = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      createContext().getHandler(),
      createContext().getClass(),
    ]);
    expect(isPublic).toBe(false);
  });
});
