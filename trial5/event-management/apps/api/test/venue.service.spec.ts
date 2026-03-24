import { NotFoundException } from '@nestjs/common';
import { VenueService } from '../src/venue/venue.service';
import { PrismaService } from '../src/common/prisma.service';
import { mockPrismaService, resetMocks, TEST_TENANT_ID } from './helpers/setup';
import { Test } from '@nestjs/testing';

describe('VenueService', () => {
  let service: VenueService;

  beforeEach(async () => {
    resetMocks();
    const module = await Test.createTestingModule({
      providers: [
        VenueService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();
    service = module.get(VenueService);
  });

  describe('create', () => {
    it('should create venue with correct data', async () => {
      const venue = {
        id: 'ven-1',
        name: 'Grand Hall',
        address: '123 Main St',
        capacity: 500,
        tenantId: TEST_TENANT_ID,
      };
      mockPrismaService.venue.create.mockResolvedValue(venue);

      const result = await service.create({
        name: 'Grand Hall',
        address: '123 Main St',
        capacity: 500,
        tenantId: TEST_TENANT_ID,
      });

      expect(result.name).toBe('Grand Hall');
      expect(result.capacity).toBe(500);
    });
  });

  describe('findAll', () => {
    it('should return paginated results with correct meta', async () => {
      mockPrismaService.venue.findMany.mockResolvedValue([
        { id: 'ven-1', name: 'Hall A' },
        { id: 'ven-2', name: 'Hall B' },
      ]);
      mockPrismaService.venue.count.mockResolvedValue(10);

      const result = await service.findAll(TEST_TENANT_ID, { page: 1, pageSize: 5 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(10);
      expect(result.meta.totalPages).toBe(2); // ceil(10/5)
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for non-existent venue', async () => {
      mockPrismaService.venue.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad-id', TEST_TENANT_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      mockPrismaService.venue.findUnique.mockResolvedValue({
        id: 'ven-1',
        tenantId: 'other-tenant',
      });
      await expect(service.findOne('ven-1', TEST_TENANT_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update venue fields selectively', async () => {
      mockPrismaService.venue.findUnique.mockResolvedValue({
        id: 'ven-1',
        tenantId: TEST_TENANT_ID,
      });
      mockPrismaService.venue.update.mockResolvedValue({
        id: 'ven-1',
        name: 'Updated Hall',
        capacity: 600,
      });

      const result = await service.update('ven-1', TEST_TENANT_ID, { name: 'Updated Hall', capacity: 600 });
      expect(result.name).toBe('Updated Hall');
      expect(result.capacity).toBe(600);
    });
  });
});
