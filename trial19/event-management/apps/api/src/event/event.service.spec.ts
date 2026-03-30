import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventService } from './event.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  event: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $executeRaw: jest.fn(),
};

describe('EventService', () => {
  let service: EventService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(EventService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated events for a tenant', async () => {
      const events = [{ id: 'e-1', title: 'Test Event', tenantId: 'tenant-1' }];
      mockPrisma.event.findMany.mockResolvedValue(events);
      mockPrisma.event.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 20);
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
      expect(result.data).toEqual(events);
      expect(result.total).toBe(1);
    });

    it('should use default pagination when not specified', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1');
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
      expect(result.data).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an event by id and tenant', async () => {
      const event = { id: 'e-1', title: 'Test', tenantId: 'tenant-1' };
      mockPrisma.event.findFirst.mockResolvedValue(event);

      const result = await service.findOne('e-1', 'tenant-1');
      expect(mockPrisma.event.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'e-1', tenantId: 'tenant-1' } }),
      );
      expect(result).toEqual(event);
    });

    it('should throw NotFoundException when event does not exist', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);
      await expect(service.findOne('nonexistent', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.event.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'nonexistent', tenantId: 'tenant-1' } }),
      );
    });
  });

  describe('create', () => {
    it('should create an event with tenant scope', async () => {
      const dto = { title: 'New Event', startDate: '2025-06-01T09:00:00Z', endDate: '2025-06-01T17:00:00Z' };
      const created = { id: 'e-new', ...dto, tenantId: 'tenant-1' };
      mockPrisma.event.create.mockResolvedValue(created);

      const result = await service.create(dto, 'tenant-1');
      expect(mockPrisma.event.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ title: 'New Event', tenantId: 'tenant-1' }),
      });
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should update an existing event', async () => {
      const existing = { id: 'e-1', title: 'Old Title', tenantId: 'tenant-1' };
      mockPrisma.event.findFirst.mockResolvedValue(existing);
      mockPrisma.event.update.mockResolvedValue({ ...existing, title: 'New Title' });

      const result = await service.update('e-1', { title: 'New Title' }, 'tenant-1');
      expect(mockPrisma.event.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'e-1' } }),
      );
      expect(result.title).toBe('New Title');
    });

    it('should throw NotFoundException when updating non-existent event', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);
      await expect(service.update('nonexistent', { title: 'X' }, 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.event.findFirst).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete an event', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ id: 'e-1', tenantId: 'tenant-1' });
      mockPrisma.event.delete.mockResolvedValue({ id: 'e-1' });

      await service.remove('e-1', 'tenant-1');
      expect(mockPrisma.event.delete).toHaveBeenCalledWith({ where: { id: 'e-1' } });
      expect(mockPrisma.event.findFirst).toHaveBeenCalled();
    });
  });

  describe('setTenantContext', () => {
    it('should call $executeRaw with tenant id', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(undefined);
      await service.setTenantContext('tenant-1');
      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
