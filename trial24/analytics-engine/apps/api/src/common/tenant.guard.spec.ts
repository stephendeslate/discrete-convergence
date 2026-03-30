// TRACED:TENANT-GUARD-SPEC
import { TenantGuard } from './tenant.guard';
import { PrismaService } from '../infra/prisma.module';
import { ExecutionContext } from '@nestjs/common';

describe('TenantGuard', () => {
  let guard: TenantGuard;
  let mockPrisma: { setTenantId: jest.Mock };

  beforeEach(() => {
    mockPrisma = { setTenantId: jest.fn().mockResolvedValue(undefined) };
    guard = new TenantGuard(mockPrisma as unknown as PrismaService);
  });

  function createContext(user?: unknown): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should set tenant ID when user has tenantId', async () => {
    const ctx = createContext({ tenantId: 't-1' });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(mockPrisma.setTenantId).toHaveBeenCalledWith('t-1');
  });

  it('should return true even without user', async () => {
    const ctx = createContext(undefined);
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(mockPrisma.setTenantId).not.toHaveBeenCalled();
  });

  it('should return true when user has no tenantId', async () => {
    const ctx = createContext({ email: 'a@b.com' });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(mockPrisma.setTenantId).not.toHaveBeenCalled();
  });
});
