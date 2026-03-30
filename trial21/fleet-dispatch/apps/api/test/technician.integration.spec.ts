import { Test, TestingModule } from '@nestjs/testing';
import { TechnicianService } from '../src/technician/technician.service';
import { PrismaService } from '../src/infra/prisma.service';
import { createMockPrisma } from './helpers/mock-prisma';
import {
  createTestTechnician,
  TENANT_ID,
  COMPANY_ID,
} from './helpers/factories';

describe('Technician Integration', () => {
  let module: TestingModule;
  let service: TechnicianService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();

    module = await Test.createTestingModule({
      providers: [
        TechnicianService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(TechnicianService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('create -> findOne -> update flow', () => {
    it('should create and retrieve a technician', async () => {
      const tech = createTestTechnician();
      prisma.technician.create.mockResolvedValue(tech);

      const created = await service.create(TENANT_ID, COMPANY_ID, {
        firstName: 'John',
        lastName: 'Tech',
        email: 'john@test.com',
        phone: '555-0200',
        skills: ['HVAC'],
      });

      expect(created.firstName).toBe('John');

      prisma.technician.findUnique.mockResolvedValue(tech);
      const found = await service.findOne(TENANT_ID, tech.id);
      expect(found.id).toBe(tech.id);
    });

    it('should update technician details', async () => {
      const tech = createTestTechnician();
      prisma.technician.findUnique.mockResolvedValue(tech);
      prisma.technician.update.mockResolvedValue({
        ...tech,
        skills: ['HVAC', 'Electrical'],
      });

      const updated = await service.update(TENANT_ID, tech.id, {
        skills: ['HVAC', 'Electrical'],
      });

      expect(updated.skills).toContain('Electrical');
    });
  });

  describe('availability', () => {
    it('should return only active technicians', async () => {
      const active = createTestTechnician({ isActive: true });
      prisma.technician.findMany.mockResolvedValue([active]);

      const available = await service.findAvailable(TENANT_ID);

      expect(available).toHaveLength(1);
      expect(prisma.technician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: TENANT_ID, isActive: true },
        }),
      );
    });
  });

  describe('GPS tracking', () => {
    it('should update technician GPS coordinates', async () => {
      const tech = createTestTechnician();
      prisma.technician.findUnique.mockResolvedValue(tech);
      prisma.$executeRaw.mockResolvedValue(1);
      prisma.technician.update.mockResolvedValue({
        ...tech,
        latitude: 40.7128,
        longitude: -74.006,
      });

      const updated = await service.updateGps(
        TENANT_ID,
        tech.id,
        40.7128,
        -74.006,
      );

      expect(updated.latitude).toBe(40.7128);
      expect(updated.longitude).toBe(-74.006);
    });

    it('should reject GPS update for wrong tenant', async () => {
      prisma.technician.findUnique.mockResolvedValue(
        createTestTechnician({ tenantId: 'other-tenant' }),
      );

      await expect(
        service.updateGps(TENANT_ID, 'tech-id', 40.7128, -74.006),
      ).rejects.toThrow('Technician not found');
    });
  });

  describe('schedule', () => {
    it('should return work orders for technician on a given date', async () => {
      const tech = createTestTechnician();
      prisma.technician.findUnique.mockResolvedValue(tech);
      prisma.workOrder.findMany.mockResolvedValue([]);

      const schedule = await service.getSchedule(
        TENANT_ID,
        tech.id,
        '2026-03-25',
      );

      expect(schedule).toEqual([]);
      expect(prisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            technicianId: tech.id,
            tenantId: TENANT_ID,
          }),
        }),
      );
    });
  });
});
