// Unit tests
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SponsorService } from './sponsor.service';
import { PrismaService } from '../infra/prisma.service';

describe('SponsorService', () => {
  let service: SponsorService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      sponsor: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      event: { findFirst: jest.fn() },
      auditLog: { create: jest.fn() },
      setTenantContext: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        SponsorService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SponsorService>(SponsorService);
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      prisma['sponsor'].findMany.mockResolvedValue([{ id: 'sp1', name: 'Acme' }]);
      prisma['sponsor'].count.mockResolvedValue(1);
      const result = await service.findAll('t1', { page: 1, pageSize: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta).toHaveProperty('page');
    });

    it('should return empty list', async () => {
      const result = await service.findAll('t1', {});
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when sponsor not found', async () => {
      prisma['sponsor'].findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad', 't1')).rejects.toThrow(NotFoundException);
    });

    it('should return sponsor when found', async () => {
      const mock = { id: 'sp1', name: 'BigCorp', tenantId: 't1' };
      prisma['sponsor'].findFirst.mockResolvedValue(mock);
      const result = await service.findOne('sp1', 't1');
      expect(result.id).toBe('sp1');
      expect(result.name).toBe('BigCorp');
    });
  });

  describe('create', () => {
    it('should throw NotFoundException for missing event on create', async () => {
      prisma['event'].findFirst.mockResolvedValue(null);
      await expect(service.create({ name: 'S', amount: 100, eventId: 'bad' }, 't1', 'u1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should create sponsor successfully', async () => {
      prisma['event'].findFirst.mockResolvedValue({ id: 'e1', tenantId: 't1' });
      const created = { id: 'sp-new', name: 'MegaCorp', tier: 'GOLD', amount: 5000, tenantId: 't1' };
      prisma['sponsor'].create.mockResolvedValue(created);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.create({ name: 'MegaCorp', amount: 5000, tier: 'GOLD', eventId: 'e1' }, 't1', 'u1');
      expect(result.id).toBe('sp-new');
      expect(result.name).toBe('MegaCorp');
      expect(result.tier).toBe('GOLD');
      expect(prisma['auditLog'].create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'CREATE', entity: 'Sponsor' }) }),
      );
    });
  });

  describe('update', () => {
    it('should update sponsor successfully', async () => {
      prisma['sponsor'].findFirst.mockResolvedValue({ id: 'sp1', name: 'Old', tenantId: 't1' });
      const updated = { id: 'sp1', name: 'NewName', tenantId: 't1' };
      prisma['sponsor'].update.mockResolvedValue(updated);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.update('sp1', { name: 'NewName' }, 't1', 'u1');
      expect(result.name).toBe('NewName');
      expect(prisma['sponsor'].update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'sp1' } }),
      );
      expect(prisma['auditLog'].create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when sponsor does not exist', async () => {
      prisma['sponsor'].findFirst.mockResolvedValue(null);
      await expect(service.update('bad', { name: 'X' }, 't1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete sponsor successfully', async () => {
      prisma['sponsor'].findFirst.mockResolvedValue({ id: 'sp1', tenantId: 't1' });
      prisma['sponsor'].delete.mockResolvedValue({});
      prisma['auditLog'].create.mockResolvedValue({});
      await service.remove('sp1', 't1', 'u1');
      expect(prisma['sponsor'].delete).toHaveBeenCalledWith({ where: { id: 'sp1' } });
      expect(prisma['auditLog'].create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'DELETE', entity: 'Sponsor', entityId: 'sp1' }) }),
      );
    });

    it('should throw NotFoundException when sponsor does not exist', async () => {
      prisma['sponsor'].findFirst.mockResolvedValue(null);
      await expect(service.remove('bad', 't1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });
});
