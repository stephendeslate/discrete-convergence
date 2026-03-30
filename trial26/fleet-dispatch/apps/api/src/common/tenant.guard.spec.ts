// TRACED:TEST-TENANT-GUARD — Tenant guard unit tests
// VERIFY:FD-GUARD-001 — TenantGuard allows valid tenant context
// VERIFY:FD-GUARD-002 — TenantGuard rejects missing tenant
import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { TenantGuard } from './tenant.guard';

function createMockContext(user: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as ExecutionContext;
}

describe('TenantGuard', () => {
  let guard: TenantGuard;

  beforeEach(() => {
    guard = new TenantGuard();
  });

  it('should allow request with valid tenant', () => {
    const ctx = createMockContext({ userId: 'u1', tenantId: 't1', email: 'a@b.com', role: 'ADMIN' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should reject request without tenant', () => {
    const ctx = createMockContext({ userId: 'u1', email: 'a@b.com', role: 'ADMIN' });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should reject request without user', () => {
    const ctx = createMockContext(undefined);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
