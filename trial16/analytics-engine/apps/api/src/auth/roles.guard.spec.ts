import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

const mockReflector = {
  getAllAndOverride: jest.fn(),
};

const createMockContext = (user?: { role: string }) => ({
  getHandler: jest.fn(),
  getClass: jest.fn(),
  switchToHttp: jest.fn().mockReturnValue({
    getRequest: jest.fn().mockReturnValue({ user }),
  }),
});

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(() => {
    guard = new RolesGuard(mockReflector as unknown as Reflector);
    jest.clearAllMocks();
  });

  it('should return true when no roles are required', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockContext({ role: 'user' });

    const result = guard.canActivate(context as unknown as ExecutionContext);

    expect(result).toBe(true);
    expect(mockReflector.getAllAndOverride).toHaveBeenCalled();
  });

  it('should return true when user has required role', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['admin']);
    const context = createMockContext({ role: 'admin' });

    const result = guard.canActivate(context as unknown as ExecutionContext);

    expect(result).toBe(true);
    expect(mockReflector.getAllAndOverride).toHaveBeenCalled();
  });

  it('should return false when user does not have required role', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['admin']);
    const context = createMockContext({ role: 'user' });

    const result = guard.canActivate(context as unknown as ExecutionContext);

    expect(result).toBe(false);
    expect(mockReflector.getAllAndOverride).toHaveBeenCalled();
  });

  it('should return false when no user on request', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['admin']);
    const context = createMockContext(undefined);

    const result = guard.canActivate(context as unknown as ExecutionContext);

    expect(result).toBe(false);
    expect(mockReflector.getAllAndOverride).toHaveBeenCalled();
  });
});
