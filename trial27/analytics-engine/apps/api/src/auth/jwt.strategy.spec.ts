import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../infra/prisma.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: { setTenantContext: jest.Mock };

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    prisma = { setTenantContext: jest.fn().mockResolvedValue(undefined) };
    strategy = new JwtStrategy(prisma as unknown as PrismaService);
  });

  it('should validate a valid payload and set tenant context', async () => {
    const payload = { sub: 'user-1', email: 'test@test.com', tenantId: 'tenant-1' };

    const result = await strategy.validate(payload);

    expect(result).toEqual({ id: 'user-1', email: 'test@test.com', tenantId: 'tenant-1' });
    expect(prisma.setTenantContext).toHaveBeenCalledWith('tenant-1');
  });

  it('should throw UnauthorizedException for missing sub', async () => {
    const payload = { sub: '', email: 'test@test.com', tenantId: 'tenant-1' };

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for missing tenantId', async () => {
    const payload = { sub: 'user-1', email: 'test@test.com', tenantId: '' };

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });
});
