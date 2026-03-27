// TRACED: FD-DM-001 — Prisma service unit tests
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have onModuleInit lifecycle method', () => {
    expect(typeof service.onModuleInit).toBe('function');
  });

  it('should have onModuleDestroy lifecycle method', () => {
    expect(typeof service.onModuleDestroy).toBe('function');
  });

  it('should have isHealthy method', () => {
    expect(typeof service.isHealthy).toBe('function');
  });
});
