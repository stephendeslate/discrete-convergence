import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventService } from '../src/event/event.service';
import { PrismaService } from '../src/infra/prisma.service';

const mockPrisma = {
  event: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $executeRaw: jest.fn(),
};

describe('EventService', () => {
  let service: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an event with proper tenant scoping', async () => {
      const dto = { title: 'Test Event', startDate: '2025-06-01', endDate: '2025-06-02' };
      const expected = { id: '1', title: 'Test Event', tenantId: 'tenant-1' };
      mockPrisma.event.create.mockResolvedValue(expected);

      const result = await service.create('tenant-1', dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ title: 'Test Event', tenantId: 'tenant-1' }),
        }),
      );
    });

    it('should default status to DRAFT when not provided', async () => {
      const dto = { title: 'Draft Event', startDate: '2025-06-01', endDate: '2025-06-02' };
      mockPrisma.event.create.mockResolvedValue({ id: '2', title: 'Draft Event', status: 'DRAFT' });

      await service.create('tenant-1', dto);

      expect(mockPrisma.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'DRAFT' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated events for tenant', async () => {
      const events = [{ id: '1', title: 'Event 1', tenantId: 'tenant-1' }];
      mockPrisma.event.findMany.mockResolvedValue(events);
      mockPrisma.event.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 20);

      expect(result.data).toEqual(events);
      expect(result.total).toBe(1);
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
    });

    it('should apply default pagination when not provided', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1');

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return event by id and tenantId', async () => {
      const event = { id: '1', title: 'Event 1', tenantId: 'tenant-1' };
      mockPrisma.event.findFirst.mockResolvedValue(event);

      const result = await service.findOne('tenant-1', '1');

      expect(result).toEqual(event);
      expect(mockPrisma.event.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1', tenantId: 'tenant-1' } }),
      );
    });

    it('should throw NotFoundException when event not found', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);

      await expect(service.findOne('tenant-1', 'nonexistent')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.event.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'nonexistent', tenantId: 'tenant-1' } }),
      );
    });
  });

  describe('update', () => {
    it('should update event with partial data', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ id: '1', title: 'Old', tenantId: 'tenant-1' });
      mockPrisma.event.update.mockResolvedValue({ id: '1', title: 'New', tenantId: 'tenant-1' });

      const result = await service.update('tenant-1', '1', { title: 'New' });

      expect(result.title).toBe('New');
      expect(mockPrisma.event.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
    });

    it('should throw NotFoundException when updating non-existent event', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);

      await expect(service.update('tenant-1', 'missing', { title: 'X' })).rejects.toThrow(NotFoundException);
      expect(mockPrisma.event.findFirst).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete an existing event', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });
      mockPrisma.event.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('tenant-1', '1');

      expect(result.id).toBe('1');
      expect(mockPrisma.event.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException when deleting non-existent event', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);

      await expect(service.remove('tenant-1', 'missing')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.event.findFirst).toHaveBeenCalled();
    });
  });

  describe('setTenantContext', () => {
    it('should execute raw SQL to set tenant context', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(undefined);

      await service.setTenantContext('tenant-1');

      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
