import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    service = new PrismaService();
  });

  afterEach(async () => {
    // Ensure disconnect is called
    try {
      await service.onModuleDestroy();
    } catch {
      // Ignore connection errors in tests
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.onModuleInit).toBeDefined();
  });

  it('should have onModuleInit method', () => {
    expect(typeof service.onModuleInit).toBe('function');
    expect(service.onModuleInit).toBeDefined();
  });

  it('should have onModuleDestroy method', () => {
    expect(typeof service.onModuleDestroy).toBe('function');
    expect(service.onModuleDestroy).toBeDefined();
  });
});
