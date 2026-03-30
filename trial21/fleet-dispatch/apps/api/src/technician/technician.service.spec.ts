import { TechnicianService } from './technician.service';
import { createMockPrisma, MockPrisma } from '../../test/helpers/mock-prisma';
import {
  createTestTechnician,
  TENANT_ID,
  COMPANY_ID,
} from '../../test/helpers/factories';

describe('TechnicianService', () => {
  let service: TechnicianService;
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new TechnicianService(prisma as never);
  });

  describe('create', () => {
    it('should create a technician', async () => {
      const tech = createTestTechnician();
      prisma.technician.create.mockResolvedValue(tech);

      const result = await service.create(TENANT_ID, COMPANY_ID, {
        firstName: 'John',
        lastName: 'Tech',
        email: 'john@tech.com',
      });

      expect(result.firstName).toBe('John');
    });
  });

  describe('findAll', () => {
    it('should return paginated technicians', async () => {
      prisma.technician.findMany.mockResolvedValue([createTestTechnician()]);
      prisma.technician.count.mockResolvedValue(1);

      const result = await service.findAll(TENANT_ID, 1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return technician by id', async () => {
      const tech = createTestTechnician();
      prisma.technician.findUnique.mockResolvedValue(tech);

      const result = await service.findOne(TENANT_ID, tech.id);
      expect(result.id).toBe(tech.id);
    });

    it('should throw for wrong tenant', async () => {
      prisma.technician.findUnique.mockResolvedValue(
        createTestTechnician({ tenantId: 'other' }),
      );

      await expect(service.findOne(TENANT_ID, 'id')).rejects.toThrow(
        'Technician not found',
      );
    });
  });

  describe('findAvailable', () => {
    it('should return only active technicians', async () => {
      prisma.technician.findMany.mockResolvedValue([
        createTestTechnician({ isActive: true }),
      ]);

      const result = await service.findAvailable(TENANT_ID);
      expect(result).toHaveLength(1);
      expect(prisma.technician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: TENANT_ID, isActive: true },
        }),
      );
    });
  });
});
