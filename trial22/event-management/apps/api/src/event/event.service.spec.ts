import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  event: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
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

  describe('findAll', () => {
    it('should return paginated events for tenant', async () => {
      const events = [{ id: '1', title: 'Event 1', tenantId: 't1' }];
      mockPrisma.event.findMany.mockResolvedValue(events);
      mockPrisma.event.count.mockResolvedValue(1);

      const result = await service.findAll('t1', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 't1' } }),
      );
    });

    it('should clamp pagination to valid values', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      const result = await service.findAll('t1', { page: -1, limit: 999 });

      expect(result.page).toBe(1);
      expect(result.limit).toBe(100);
    });
  });

  describe('findOne', () => {
    it('should return event for matching tenant', async () => {
      mockPrisma.event.findUnique.mockResolvedValue({ id: '1', tenantId: 't1', title: 'Test' });

      const result = await service.findOne('1', 't1');

      expect(result.id).toBe('1');
      expect(mockPrisma.event.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      mockPrisma.event.findUnique.mockResolvedValue({ id: '1', tenantId: 'other' });

      await expect(service.findOne('1', 't1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when event does not exist', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing', 't1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create event with tenant and status', async () => {
      const dto = { title: 'New Event', startDate: '2026-01-01', endDate: '2026-01-02', capacity: 100 };
      mockPrisma.event.create.mockResolvedValue({ id: '1', ...dto, tenantId: 't1' });

      const result = await service.create('t1', dto);

      expect(result.id).toBe('1');
      expect(mockPrisma.event.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'New Event',
          tenantId: 't1',
        }),
      });
    });
  });

  describe('remove', () => {
    it('should delete event after verifying ownership', async () => {
      mockPrisma.event.findUnique.mockResolvedValue({ id: '1', tenantId: 't1' });
      mockPrisma.event.delete.mockResolvedValue({ id: '1' });

      await service.remove('1', 't1');

      expect(mockPrisma.event.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException for non-existent event delete', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing', 't1')).rejects.toThrow(NotFoundException);
    });
  });
});
