import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventService } from '../src/event/event.service';
import { PrismaService } from '../src/infra/prisma.service';

describe('EventService', () => {
  let service: EventService;

  const mockPrisma = {
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $executeRaw: jest.fn().mockResolvedValue(1),
  };

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

  describe('findOne', () => {
    it('should throw NotFoundException when event not found', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad-id', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return event when found', async () => {
      const mockEvent = { id: 'evt-1', title: 'Test', tenantId: 'tenant-1' };
      mockPrisma.event.findFirst.mockResolvedValue(mockEvent);
      const result = await service.findOne('evt-1', 'tenant-1');
      expect(result).toEqual(mockEvent);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no events', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);
      const result = await service.findAll('tenant-1');
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should respect pagination parameters', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);
      const result = await service.findAll('tenant-1', '2', '5');
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(5);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when deleting non-existent', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);
      await expect(service.remove('bad-id', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when updating non-existent', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);
      await expect(
        service.update('bad-id', { title: 'Updated' }, 'tenant-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getEventStats', () => {
    it('should return stats result', async () => {
      const result = await service.getEventStats('tenant-1');
      expect(result).toHaveProperty('affectedRows');
    });
  });
});
