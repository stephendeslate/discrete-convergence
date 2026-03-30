import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { TenantGuard } from './tenant.guard';

function mockContext(user?: { companyId?: string }): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('TenantGuard', () => {
  const guard = new TenantGuard();

  it('returns true when user has companyId', () => {
    expect(guard.canActivate(mockContext({ companyId: 'c1' }))).toBe(true);
  });

  it('throws ForbiddenException when user has no companyId', () => {
    expect(() => guard.canActivate(mockContext({}))).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when no user on request', () => {
    expect(() => guard.canActivate(mockContext(undefined))).toThrow(ForbiddenException);
  });
});
