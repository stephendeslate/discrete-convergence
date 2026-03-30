import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have setTenantContext method', () => {
    expect(typeof service.setTenantContext).toBe('function');
  });

  it('should reject cleanDatabase in non-test environment', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    await expect(service.cleanDatabase()).rejects.toThrow('cleanDatabase is only available in test environment');
    process.env.NODE_ENV = originalEnv;
  });
});
