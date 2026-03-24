import { NotFoundException } from '@nestjs/common';
import { EventService } from '../src/event/event.service';
import { PrismaService } from '../src/common/prisma.service';
import { mockPrismaService, resetMocks, TEST_TENANT_ID } from './helpers/setup';
import { Test } from '@nestjs/testing';

describe('EventService', () => {
  let service: EventService;

  beforeEach(async () => {
    resetMocks();
    const module = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();
    service = module.get(EventService);
  });

  describe('create', () => {
    it('should create event with correct data transformation', async () => {
      const created = {
        id: 'evt-1',
        title: 'Test Event',
        description: 'Desc',
        status: 'DRAFT',
        startDate: new Date('2026-06-01T09:00:00Z'),
        endDate: new Date('2026-06-01T17:00:00Z'),
        tenantId: TEST_TENANT_ID,
        venueId: null,
        venue: null,
      };
      mockPrismaService.event.create.mockResolvedValue(created);

      const result = await service.create({
        title: 'Test Event',
        description: 'Desc',
        startDate: '2026-06-01T09:00:00Z',
        endDate: '2026-06-01T17:00:00Z',
        tenantId: TEST_TENANT_ID,
      });

      expect(result.id).toBe('evt-1');
      expect(result.title).toBe('Test Event');
      expect(result.status).toBe('DRAFT');
      expect(mockPrismaService.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Test Event',
            tenantId: TEST_TENANT_ID,
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results with computed totalPages', async () => {
      const events = Array.from({ length: 3 }, (_, i) => ({
        id: `evt-${i}`,
        title: `Event ${i}`,
        tenantId: TEST_TENANT_ID,
      }));
      mockPrismaService.event.findMany.mockResolvedValue(events);
      mockPrismaService.event.count.mockResolvedValue(25);

      const result = await service.findAll(TEST_TENANT_ID, { page: 1, pageSize: 3 });

      expect(result.data).toHaveLength(3);
      expect(result.meta.total).toBe(25);
      expect(result.meta.page).toBe(1);
      expect(result.meta.pageSize).toBe(3);
      expect(result.meta.totalPages).toBe(9); // ceil(25/3)
    });
  });

  describe('findOne', () => {
    it('should return event when found with matching tenant', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({
        id: 'evt-1',
        title: 'Found',
        tenantId: TEST_TENANT_ID,
      });

      const result = await service.findOne('evt-1', TEST_TENANT_ID);
      expect(result.title).toBe('Found');
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({
        id: 'evt-1',
        tenantId: 'other-tenant',
      });

      await expect(service.findOne('evt-1', TEST_TENANT_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when event does not exist', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent', TEST_TENANT_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete event after verifying ownership', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({
        id: 'evt-1',
        tenantId: TEST_TENANT_ID,
      });
      mockPrismaService.event.delete.mockResolvedValue({ id: 'evt-1' });

      const result = await service.remove('evt-1', TEST_TENANT_ID);
      expect(result.id).toBe('evt-1');
      expect(mockPrismaService.event.delete).toHaveBeenCalledWith({ where: { id: 'evt-1' } });
    });
  });
});
