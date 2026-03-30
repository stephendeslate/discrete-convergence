// Unit tests
import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { EventService } from './event.service';
import { PrismaService } from '../infra/prisma.service';

describe('EventService', () => {
  let service: EventService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      event: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      auditLog: { create: jest.fn() },
      $executeRaw: jest.fn(),
      setTenantContext: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  describe('findAll', () => {
    it('should return paginated results with correct meta', async () => {
      prisma['event'].findMany.mockResolvedValue([{ id: '1', title: 'Evt' }]);
      prisma['event'].count.mockResolvedValue(1);
      const result = await service.findAll('t1', { page: 1, pageSize: 10 });
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should return empty data when no events exist', async () => {
      prisma['event'].findMany.mockResolvedValue([]);
      prisma['event'].count.mockResolvedValue(0);
      const result = await service.findAll('t1', {});
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should call setTenantContext before querying', async () => {
      await service.findAll('tenant-abc', {});
      expect(prisma.setTenantContext).toHaveBeenCalledWith('tenant-abc');
      expect(prisma['event'].findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      prisma['event'].findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad-id', 't1')).rejects.toThrow(NotFoundException);
    });

    it('should return event when found', async () => {
      const mockEvent = { id: '1', title: 'Test Event', tenantId: 't1' };
      prisma['event'].findFirst.mockResolvedValue(mockEvent);
      const result = await service.findOne('1', 't1');
      expect(result).toBe(mockEvent);
      expect(result.id).toBe('1');
      expect(result.title).toBe('Test Event');
    });
  });

  describe('create', () => {
    it('should throw ConflictException for duplicate slug', async () => {
      prisma['event'].findFirst.mockResolvedValue({ id: '1' });
      await expect(service.create({
        title: 'Test', slug: 'test', startDate: '2025-01-01', endDate: '2025-01-02', capacity: 100,
      }, 't1', 'u1')).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if end date before start date', async () => {
      prisma['event'].findFirst.mockResolvedValue(null);
      await expect(service.create({
        title: 'Test', slug: 'test', startDate: '2025-01-02', endDate: '2025-01-01', capacity: 100,
      }, 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should create event successfully with valid data', async () => {
      prisma['event'].findFirst.mockResolvedValue(null);
      const created = { id: 'new-1', title: 'Conf', slug: 'conf', tenantId: 't1' };
      prisma['event'].create.mockResolvedValue(created);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.create({
        title: 'Conf', slug: 'conf', startDate: '2026-06-01', endDate: '2026-06-02', capacity: 200,
      }, 't1', 'u1');
      expect(result.id).toBe('new-1');
      expect(result.title).toBe('Conf');
      expect(prisma['auditLog'].create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'CREATE', entity: 'Event' }) }),
      );
    });

    it('should throw BadRequestException if end date equals start date', async () => {
      prisma['event'].findFirst.mockResolvedValue(null);
      await expect(service.create({
        title: 'Test', slug: 'test', startDate: '2025-01-01', endDate: '2025-01-01', capacity: 100,
      }, 't1', 'u1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update event successfully', async () => {
      const existing = { id: '1', title: 'Old', tenantId: 't1', startDate: new Date('2026-01-01') };
      prisma['event'].findFirst.mockResolvedValue(existing);
      const updated = { id: '1', title: 'New Title', tenantId: 't1' };
      prisma['event'].update.mockResolvedValue(updated);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.update('1', { title: 'New Title' }, 't1', 'u1');
      expect(result.title).toBe('New Title');
      expect(prisma['event'].update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
      expect(prisma['auditLog'].create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when both dates provided and end before start', async () => {
      const existing = { id: '1', tenantId: 't1', startDate: new Date('2026-01-01') };
      prisma['event'].findFirst.mockResolvedValue(existing);
      await expect(service.update('1', { startDate: '2026-06-10', endDate: '2026-06-01' }, 't1', 'u1'))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when only endDate provided and before existing startDate', async () => {
      const existing = { id: '1', tenantId: 't1', startDate: new Date('2026-06-15') };
      prisma['event'].findFirst.mockResolvedValue(existing);
      await expect(service.update('1', { endDate: '2026-06-10' }, 't1', 'u1'))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when event does not exist', async () => {
      prisma['event'].findFirst.mockResolvedValue(null);
      await expect(service.update('bad', { title: 'X' }, 't1', 'u1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete event successfully', async () => {
      prisma['event'].findFirst.mockResolvedValue({ id: '1', tenantId: 't1' });
      prisma['event'].delete.mockResolvedValue({});
      prisma['auditLog'].create.mockResolvedValue({});
      await service.remove('1', 't1', 'u1');
      expect(prisma['event'].delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(prisma['auditLog'].create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'DELETE', entity: 'Event', entityId: '1' }) }),
      );
    });

    it('should throw NotFoundException if event does not exist', async () => {
      prisma['event'].findFirst.mockResolvedValue(null);
      await expect(service.remove('bad', 't1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('publish', () => {
    it('should throw BadRequestException for non-draft event', async () => {
      prisma['event'].findFirst.mockResolvedValue({
        id: '1', status: 'PUBLISHED', startDate: new Date('2099-01-01'), capacity: 100, tenantId: 't1',
      });
      await expect(service.publish('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for past start date', async () => {
      prisma['event'].findFirst.mockResolvedValue({
        id: '1', status: 'DRAFT', startDate: new Date('2020-01-01'), capacity: 100, tenantId: 't1',
      });
      await expect(service.publish('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for zero capacity', async () => {
      prisma['event'].findFirst.mockResolvedValue({
        id: '1', status: 'DRAFT', startDate: new Date('2099-01-01'), capacity: 0, tenantId: 't1',
      });
      await expect(service.publish('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should publish draft event with valid data', async () => {
      prisma['event'].findFirst.mockResolvedValue({
        id: '1', status: 'DRAFT', startDate: new Date('2099-01-01'), capacity: 100, tenantId: 't1',
      });
      const published = { id: '1', status: 'PUBLISHED', tenantId: 't1' };
      prisma['event'].update.mockResolvedValue(published);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.publish('1', 't1', 'u1');
      expect(result.status).toBe('PUBLISHED');
      expect(prisma['event'].update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'PUBLISHED' } }),
      );
      expect(prisma['auditLog'].create).toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should throw BadRequestException for already cancelled event', async () => {
      prisma['event'].findFirst.mockResolvedValue({
        id: '1', status: 'CANCELLED', tenantId: 't1',
      });
      await expect(service.cancel('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for completed event', async () => {
      prisma['event'].findFirst.mockResolvedValue({
        id: '1', status: 'COMPLETED', tenantId: 't1',
      });
      await expect(service.cancel('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should cancel a draft event successfully', async () => {
      prisma['event'].findFirst.mockResolvedValue({
        id: '1', status: 'DRAFT', tenantId: 't1',
      });
      const cancelled = { id: '1', status: 'CANCELLED', tenantId: 't1' };
      prisma['event'].update.mockResolvedValue(cancelled);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.cancel('1', 't1', 'u1');
      expect(result.status).toBe('CANCELLED');
      expect(prisma['event'].update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'CANCELLED' } }),
      );
    });

    it('should cancel a published event successfully', async () => {
      prisma['event'].findFirst.mockResolvedValue({
        id: '1', status: 'PUBLISHED', tenantId: 't1',
      });
      const cancelled = { id: '1', status: 'CANCELLED', tenantId: 't1' };
      prisma['event'].update.mockResolvedValue(cancelled);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.cancel('1', 't1', 'u1');
      expect(result.status).toBe('CANCELLED');
      expect(prisma['auditLog'].create).toHaveBeenCalled();
    });
  });
});
