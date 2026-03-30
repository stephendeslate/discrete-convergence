// TRACED:EM-API-013 — Integration tests for EventService CRUD
import type { TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventService } from '../src/event/event.service';
import { mockPrismaService, resetMocks, createTestModule, TEST_TENANT_ID } from './helpers/setup';

describe('EventService', () => {
  let service: EventService;

  beforeEach(async () => {
    resetMocks();
    const module: TestingModule = await createTestModule([EventService]);
    service = module.get<EventService>(EventService);
  });

  describe('create', () => {
    it('should create an event with venue included', async () => {
      const dto = {
        title: 'Tech Conference',
        description: 'Annual tech conference',
        startDate: '2026-06-15T09:00:00Z',
        endDate: '2026-06-17T18:00:00Z',
        tenantId: TEST_TENANT_ID,
      };
      const created = {
        id: 'event-001',
        ...dto,
        status: 'DRAFT',
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        venue: null,
      };
      mockPrismaService.event.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toEqual(created);
      expect(mockPrismaService.event.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Tech Conference',
          tenantId: TEST_TENANT_ID,
        }),
        include: { venue: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated events for tenant', async () => {
      const events = [
        { id: 'event-001', title: 'Event 1', tenantId: TEST_TENANT_ID },
        { id: 'event-002', title: 'Event 2', tenantId: TEST_TENANT_ID },
      ];
      mockPrismaService.event.findMany.mockResolvedValue(events);
      mockPrismaService.event.count.mockResolvedValue(2);

      const result = await service.findAll(TEST_TENANT_ID, { page: 1, pageSize: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(mockPrismaService.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: TEST_TENANT_ID },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return event when found and tenant matches', async () => {
      const event = { id: 'event-001', title: 'Event', tenantId: TEST_TENANT_ID };
      mockPrismaService.event.findUnique.mockResolvedValue(event);

      const result = await service.findOne('event-001', TEST_TENANT_ID);
      expect(result).toEqual(event);
    });

    it('should throw NotFoundException when event not found', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing', TEST_TENANT_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when tenant does not match', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({
        id: 'event-001',
        tenantId: 'other-tenant',
      });

      await expect(service.findOne('event-001', TEST_TENANT_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update event after verifying tenant', async () => {
      const existing = { id: 'event-001', tenantId: TEST_TENANT_ID };
      mockPrismaService.event.findUnique.mockResolvedValue(existing);
      mockPrismaService.event.update.mockResolvedValue({
        ...existing,
        title: 'Updated Title',
      });

      const result = await service.update('event-001', TEST_TENANT_ID, {
        title: 'Updated Title',
      });

      expect(result.title).toBe('Updated Title');
    });
  });

  describe('remove', () => {
    it('should delete event after verifying tenant', async () => {
      const existing = { id: 'event-001', tenantId: TEST_TENANT_ID };
      mockPrismaService.event.findUnique.mockResolvedValue(existing);
      mockPrismaService.event.delete.mockResolvedValue(existing);

      const result = await service.remove('event-001', TEST_TENANT_ID);
      expect(result).toEqual(existing);
    });
  });
});
