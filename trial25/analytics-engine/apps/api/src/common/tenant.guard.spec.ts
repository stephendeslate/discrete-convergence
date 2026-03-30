// TRACED:TENANT-GUARD-TEST — Tenant guard tests
import { TenantGuard } from './tenant.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('TenantGuard', () => {
  let guard: TenantGuard;

  beforeEach(() => {
    guard = new TenantGuard();
  });

  function createContext(user: unknown): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow request with valid tenant', () => {
    const context = createContext({
      userId: '1',
      tenantId: 'tenant-1',
      email: 'test@test.com',
      role: 'ADMIN',
    });
    const result = guard.canActivate(context);
    expect(result).toBe(true);
    expect(typeof result).toBe('boolean');
  });

  it('should reject request without user', () => {
    const context = createContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow();
  });

  it('should reject request without tenantId', () => {
    const context = createContext({
      userId: '1',
      tenantId: '',
      email: 'test@test.com',
      role: 'ADMIN',
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow();
  });
});
