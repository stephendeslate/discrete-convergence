// Unit tests
import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SessionService } from './session.service';
import { PrismaService } from '../infra/prisma.service';

describe('SessionService', () => {
  let service: SessionService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      session: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
      },
      event: { findFirst: jest.fn() },
      auditLog: { create: jest.fn() },
      setTenantContext: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  describe('findAll', () => {
    it('should return paginated results with meta', async () => {
      prisma['session'].findMany.mockResolvedValue([{ id: 's1', title: 'Keynote' }]);
      prisma['session'].count.mockResolvedValue(1);
      const result = await service.findAll('t1', { page: 1, pageSize: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta).toHaveProperty('page');
    });

    it('should return empty list when no sessions', async () => {
      const result = await service.findAll('t1', {});
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      prisma['session'].findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad', 't1')).rejects.toThrow(NotFoundException);
    });

    it('should return session when found', async () => {
      const mock = { id: 's1', title: 'Talk', tenantId: 't1' };
      prisma['session'].findFirst.mockResolvedValue(mock);
      const result = await service.findOne('s1', 't1');
      expect(result.id).toBe('s1');
      expect(result.title).toBe('Talk');
    });
  });

  describe('create', () => {
    it('should throw NotFoundException when event does not exist', async () => {
      prisma['event'].findFirst.mockResolvedValue(null);
      await expect(service.create({
        title: 'Talk', startTime: '2026-06-01T10:00:00Z', endTime: '2026-06-01T11:00:00Z', eventId: 'bad',
      }, 't1', 'u1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when end time before start time', async () => {
      prisma['event'].findFirst.mockResolvedValue({ id: 'e1', tenantId: 't1' });
      await expect(service.create({
        title: 'Talk', startTime: '2026-06-01T12:00:00Z', endTime: '2026-06-01T10:00:00Z', eventId: 'e1',
      }, 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should create session successfully with valid data', async () => {
      prisma['event'].findFirst.mockResolvedValue({ id: 'e1', tenantId: 't1' });
      const created = { id: 's-new', title: 'Workshop', tenantId: 't1' };
      prisma['session'].create.mockResolvedValue(created);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.create({
        title: 'Workshop', startTime: '2026-06-01T10:00:00Z', endTime: '2026-06-01T12:00:00Z', eventId: 'e1',
      }, 't1', 'u1');
      expect(result.id).toBe('s-new');
      expect(result.title).toBe('Workshop');
      expect(prisma['auditLog'].create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'CREATE', entity: 'Session' }) }),
      );
    });

    it('should throw BadRequestException when end time equals start time', async () => {
      prisma['event'].findFirst.mockResolvedValue({ id: 'e1', tenantId: 't1' });
      await expect(service.create({
        title: 'Talk', startTime: '2026-06-01T10:00:00Z', endTime: '2026-06-01T10:00:00Z', eventId: 'e1',
      }, 't1', 'u1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update session successfully', async () => {
      const existing = { id: 's1', title: 'Old', tenantId: 't1', startTime: new Date('2026-06-01T10:00:00Z') };
      prisma['session'].findFirst.mockResolvedValue(existing);
      const updated = { id: 's1', title: 'New Title', tenantId: 't1' };
      prisma['session'].update.mockResolvedValue(updated);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.update('s1', { title: 'New Title' }, 't1', 'u1');
      expect(result.title).toBe('New Title');
      expect(prisma['session'].update).toHaveBeenCalled();
      expect(prisma['auditLog'].create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when both times provided and end before start', async () => {
      const existing = { id: 's1', tenantId: 't1', startTime: new Date('2026-06-01T10:00:00Z') };
      prisma['session'].findFirst.mockResolvedValue(existing);
      await expect(service.update('s1', {
        startTime: '2026-06-01T14:00:00Z', endTime: '2026-06-01T12:00:00Z',
      }, 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when only endTime provided and before existing startTime', async () => {
      const existing = { id: 's1', tenantId: 't1', startTime: new Date('2026-06-01T14:00:00Z') };
      prisma['session'].findFirst.mockResolvedValue(existing);
      await expect(service.update('s1', { endTime: '2026-06-01T12:00:00Z' }, 't1', 'u1'))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when session does not exist', async () => {
      prisma['session'].findFirst.mockResolvedValue(null);
      await expect(service.update('bad', { title: 'X' }, 't1', 'u1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('confirmSession', () => {
    it('should throw for non-draft session', async () => {
      prisma['session'].findFirst.mockResolvedValue({
        id: '1', status: 'CONFIRMED', speakerId: 's1', tenantId: 't1', eventId: 'e1',
      });
      await expect(service.confirmSession('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should throw for session without speaker', async () => {
      prisma['session'].findFirst.mockResolvedValue({
        id: '1', status: 'DRAFT', speakerId: null, tenantId: 't1', eventId: 'e1',
      });
      await expect(service.confirmSession('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should throw for cancelled event', async () => {
      prisma['session'].findFirst.mockResolvedValue({
        id: '1', status: 'DRAFT', speakerId: 's1', tenantId: 't1', eventId: 'e1',
      });
      prisma['event'].findFirst.mockResolvedValue({ id: 'e1', status: 'CANCELLED' });
      await expect(service.confirmSession('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should confirm draft session with speaker and active event', async () => {
      prisma['session'].findFirst.mockResolvedValue({
        id: '1', status: 'DRAFT', speakerId: 's1', tenantId: 't1', eventId: 'e1',
      });
      prisma['event'].findFirst.mockResolvedValue({ id: 'e1', status: 'PUBLISHED' });
      const confirmed = { id: '1', status: 'CONFIRMED', tenantId: 't1' };
      prisma['session'].update.mockResolvedValue(confirmed);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.confirmSession('1', 't1', 'u1');
      expect(result.status).toBe('CONFIRMED');
      expect(prisma['session'].update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'CONFIRMED' } }),
      );
      expect(prisma['auditLog'].create).toHaveBeenCalled();
    });
  });

  describe('cancelSession', () => {
    it('should throw for already cancelled session', async () => {
      prisma['session'].findFirst.mockResolvedValue({
        id: '1', status: 'CANCELLED', tenantId: 't1',
      });
      await expect(service.cancelSession('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should cancel a draft session successfully', async () => {
      prisma['session'].findFirst.mockResolvedValue({
        id: '1', status: 'DRAFT', tenantId: 't1',
      });
      const cancelled = { id: '1', status: 'CANCELLED', tenantId: 't1' };
      prisma['session'].update.mockResolvedValue(cancelled);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.cancelSession('1', 't1', 'u1');
      expect(result.status).toBe('CANCELLED');
      expect(prisma['session'].update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'CANCELLED' } }),
      );
      expect(prisma['auditLog'].create).toHaveBeenCalled();
    });

    it('should cancel a confirmed session successfully', async () => {
      prisma['session'].findFirst.mockResolvedValue({
        id: '1', status: 'CONFIRMED', tenantId: 't1',
      });
      const cancelled = { id: '1', status: 'CANCELLED', tenantId: 't1' };
      prisma['session'].update.mockResolvedValue(cancelled);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.cancelSession('1', 't1', 'u1');
      expect(result.status).toBe('CANCELLED');
      expect(prisma['auditLog'].create).toHaveBeenCalled();
    });
  });
});
