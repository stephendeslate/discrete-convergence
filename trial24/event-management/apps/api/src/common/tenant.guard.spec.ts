// TRACED:TENANT-GUARD-SPEC
import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { TenantGuard } from './tenant.guard';
import { PrismaService } from '../infra/prisma.module';

describe('TenantGuard', () => {
  let guard: TenantGuard;
  let mockPrisma: { setOrganizationId: jest.Mock };

  beforeEach(() => {
    mockPrisma = { setOrganizationId: jest.fn() };
    guard = new TenantGuard(mockPrisma as unknown as PrismaService);
  });

  function createCtx(user?: unknown): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow and set organizationId when user has it', async () => {
    const ctx = createCtx({ sub: 'u1', organizationId: 'org-1' });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(mockPrisma.setOrganizationId).toHaveBeenCalledWith('org-1');
  });

  it('should throw ForbiddenException when user has no organizationId (forbidden)', async () => {
    const ctx = createCtx({ sub: 'u1' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    expect(mockPrisma.setOrganizationId).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when no user (unauthorized)', async () => {
    const ctx = createCtx(undefined);
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    expect(mockPrisma.setOrganizationId).not.toHaveBeenCalled();
  });
});
