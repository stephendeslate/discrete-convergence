// Unit tests
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SpeakerService } from './speaker.service';
import { PrismaService } from '../infra/prisma.service';

describe('SpeakerService', () => {
  let service: SpeakerService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      speaker: {
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
        SpeakerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SpeakerService>(SpeakerService);
  });

  describe('findOne', () => {
    it('should throw NotFoundException when speaker not found', async () => {
      prisma['speaker'].findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad', 't1')).rejects.toThrow(NotFoundException);
    });

    it('should return speaker when found', async () => {
      const mock = { id: 'sp1', name: 'Dr. Smith', tenantId: 't1' };
      prisma['speaker'].findFirst.mockResolvedValue(mock);
      const result = await service.findOne('sp1', 't1');
      expect(result.id).toBe('sp1');
      expect(result.name).toBe('Dr. Smith');
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      prisma['speaker'].findMany.mockResolvedValue([{ id: 'sp1', name: 'Jane' }]);
      prisma['speaker'].count.mockResolvedValue(1);
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
    it('should create speaker successfully', async () => {
      const created = { id: 'sp-new', name: 'Prof. Jones', tenantId: 't1' };
      prisma['speaker'].create.mockResolvedValue(created);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.create({ name: 'Prof. Jones', bio: 'Expert', email: 'j@j.com' }, 't1', 'u1');
      expect(result.id).toBe('sp-new');
      expect(result.name).toBe('Prof. Jones');
      expect(prisma['auditLog'].create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'CREATE', entity: 'Speaker' }) }),
      );
    });
  });

  describe('update', () => {
    it('should update speaker successfully', async () => {
      prisma['speaker'].findFirst.mockResolvedValue({ id: 'sp1', name: 'Old', tenantId: 't1' });
      const updated = { id: 'sp1', name: 'Updated Name', tenantId: 't1' };
      prisma['speaker'].update.mockResolvedValue(updated);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.update('sp1', { name: 'Updated Name' }, 't1', 'u1');
      expect(result.name).toBe('Updated Name');
      expect(prisma['speaker'].update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'sp1' } }),
      );
      expect(prisma['auditLog'].create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when speaker does not exist', async () => {
      prisma['speaker'].findFirst.mockResolvedValue(null);
      await expect(service.update('bad', { name: 'X' }, 't1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete speaker successfully', async () => {
      prisma['speaker'].findFirst.mockResolvedValue({ id: 'sp1', tenantId: 't1' });
      prisma['speaker'].delete.mockResolvedValue({});
      prisma['auditLog'].create.mockResolvedValue({});
      await service.remove('sp1', 't1', 'u1');
      expect(prisma['speaker'].delete).toHaveBeenCalledWith({ where: { id: 'sp1' } });
      expect(prisma['auditLog'].create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'DELETE', entity: 'Speaker', entityId: 'sp1' }) }),
      );
    });

    it('should throw NotFoundException when speaker does not exist', async () => {
      prisma['speaker'].findFirst.mockResolvedValue(null);
      await expect(service.remove('bad', 't1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });
});
