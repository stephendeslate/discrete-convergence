// TRACED:EM-API-015 — Integration tests for VenueService CRUD
import type { TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VenueService } from '../src/venue/venue.service';
import { mockPrismaService, resetMocks, createTestModule, TEST_TENANT_ID } from './helpers/setup';

describe('VenueService', () => {
  let service: VenueService;

  beforeEach(async () => {
    resetMocks();
    const module: TestingModule = await createTestModule([VenueService]);
    service = module.get<VenueService>(VenueService);
  });

  describe('create', () => {
    it('should create a venue', async () => {
      const dto = {
        name: 'Grand Hall',
        address: '123 Main St',
        capacity: 5000,
        tenantId: TEST_TENANT_ID,
      };
      const created = { id: 'venue-001', ...dto };
      mockPrismaService.venue.create.mockResolvedValue(created);

      const result = await service.create(dto);
      expect(result).toEqual(created);
      expect(mockPrismaService.venue.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Grand Hall',
          tenantId: TEST_TENANT_ID,
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated venues for tenant', async () => {
      const venues = [{ id: 'venue-001' }, { id: 'venue-002' }];
      mockPrismaService.venue.findMany.mockResolvedValue(venues);
      mockPrismaService.venue.count.mockResolvedValue(2);

      const result = await service.findAll(TEST_TENANT_ID, { page: 1, pageSize: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(mockPrismaService.venue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: TEST_TENANT_ID },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return venue when found and tenant matches', async () => {
      const venue = { id: 'venue-001', tenantId: TEST_TENANT_ID };
      mockPrismaService.venue.findUnique.mockResolvedValue(venue);

      const result = await service.findOne('venue-001', TEST_TENANT_ID);
      expect(result).toEqual(venue);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.venue.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing', TEST_TENANT_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when tenant does not match', async () => {
      mockPrismaService.venue.findUnique.mockResolvedValue({
        id: 'venue-001',
        tenantId: 'other-tenant',
      });

      await expect(service.findOne('venue-001', TEST_TENANT_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update venue after verifying tenant', async () => {
      mockPrismaService.venue.findUnique.mockResolvedValue({
        id: 'venue-001',
        tenantId: TEST_TENANT_ID,
      });
      mockPrismaService.venue.update.mockResolvedValue({
        id: 'venue-001',
        name: 'Updated Hall',
        tenantId: TEST_TENANT_ID,
      });

      const result = await service.update('venue-001', TEST_TENANT_ID, {
        name: 'Updated Hall',
      });
      expect(result.name).toBe('Updated Hall');
    });
  });

  describe('remove', () => {
    it('should delete venue after verifying tenant', async () => {
      const venue = { id: 'venue-001', tenantId: TEST_TENANT_ID };
      mockPrismaService.venue.findUnique.mockResolvedValue(venue);
      mockPrismaService.venue.delete.mockResolvedValue(venue);

      const result = await service.remove('venue-001', TEST_TENANT_ID);
      expect(result).toEqual(venue);
    });
  });
});
