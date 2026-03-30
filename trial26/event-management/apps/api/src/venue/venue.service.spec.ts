// Unit tests
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VenueService } from './venue.service';
import { PrismaService } from '../infra/prisma.service';

describe('VenueService', () => {
  let service: VenueService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      venue: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      auditLog: { create: jest.fn() },
      setTenantContext: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        VenueService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<VenueService>(VenueService);
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      prisma['venue'].findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad-id', 't1')).rejects.toThrow(NotFoundException);
    });

    it('should return venue when found', async () => {
      const mock = { id: 'v1', name: 'Main Hall', tenantId: 't1' };
      prisma['venue'].findFirst.mockResolvedValue(mock);
      const result = await service.findOne('v1', 't1');
      expect(result.id).toBe('v1');
      expect(result.name).toBe('Main Hall');
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      prisma['venue'].findMany.mockResolvedValue([{ id: 'v1', name: 'Arena' }]);
      prisma['venue'].count.mockResolvedValue(1);
      const result = await service.findAll('t1', { page: 1, pageSize: 10 });
      expect(result.meta).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should return empty results', async () => {
      const result = await service.findAll('t1', {});
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('create', () => {
    it('should create venue successfully', async () => {
      const created = { id: 'v-new', name: 'Convention Center', tenantId: 't1' };
      prisma['venue'].create.mockResolvedValue(created);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.create({ name: 'Convention Center', address: '123 Main St', city: 'Portland', capacity: 500 }, 't1', 'u1');
      expect(result.id).toBe('v-new');
      expect(result.name).toBe('Convention Center');
      expect(prisma['auditLog'].create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'CREATE', entity: 'Venue' }) }),
      );
    });
  });

  describe('update', () => {
    it('should update venue successfully', async () => {
      prisma['venue'].findFirst.mockResolvedValue({ id: 'v1', name: 'Old', tenantId: 't1' });
      const updated = { id: 'v1', name: 'New Name', tenantId: 't1' };
      prisma['venue'].update.mockResolvedValue(updated);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.update('v1', { name: 'New Name' }, 't1', 'u1');
      expect(result.name).toBe('New Name');
      expect(prisma['venue'].update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'v1' } }),
      );
      expect(prisma['auditLog'].create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when venue does not exist', async () => {
      prisma['venue'].findFirst.mockResolvedValue(null);
      await expect(service.update('bad', { name: 'X' }, 't1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete venue successfully', async () => {
      prisma['venue'].findFirst.mockResolvedValue({ id: 'v1', tenantId: 't1' });
      prisma['venue'].delete.mockResolvedValue({});
      prisma['auditLog'].create.mockResolvedValue({});
      await service.remove('v1', 't1', 'u1');
      expect(prisma['venue'].delete).toHaveBeenCalledWith({ where: { id: 'v1' } });
      expect(prisma['auditLog'].create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'DELETE', entity: 'Venue', entityId: 'v1' }) }),
      );
    });

    it('should throw NotFoundException when venue does not exist', async () => {
      prisma['venue'].findFirst.mockResolvedValue(null);
      await expect(service.remove('bad', 't1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });
});
