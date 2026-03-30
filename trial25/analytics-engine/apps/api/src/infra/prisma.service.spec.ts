// TRACED:PRISMA-SVC-TEST — Prisma service tests
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
  });

  afterEach(async () => {
    await service.$disconnect().catch(() => { /* ignore disconnect errors in tests */ });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(typeof service.setTenantContext).toBe('function');
  });

  it('should throw if tenantId is empty', async () => {
    await expect(service.setTenantContext('')).rejects.toThrow(
      'tenantId is required',
    );
    await expect(service.setTenantContext('')).rejects.toBeInstanceOf(Error);
  });

  it('should have onModuleInit method', () => {
    expect(typeof service.onModuleInit).toBe('function');
    expect(service.onModuleInit).toBeDefined();
  });

  it('should have onModuleDestroy method', () => {
    expect(typeof service.onModuleDestroy).toBe('function');
    expect(service.onModuleDestroy).toBeDefined();
  });

  it('should have withTenant method', () => {
    expect(typeof service.withTenant).toBe('function');
    expect(service.withTenant).toBeDefined();
  });
});
