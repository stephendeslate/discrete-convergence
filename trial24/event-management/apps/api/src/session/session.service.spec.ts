// TRACED:SESSION-SERVICE-SPEC
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SessionService } from './session.service';
import { PrismaService } from '../infra/prisma.module';

const mockPrisma = {
  session: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('SessionService', () => {
  let service: SessionService;
  const orgId = '00000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  describe('create', () => {
    it('should create a session linked to event', async () => {
      const dto = {
        title: 'Keynote',
        startTime: '2024-06-15T09:00:00Z',
        endTime: '2024-06-15T10:00:00Z',
        eventId: 'event-1',
      };
      mockPrisma.session.create.mockResolvedValue({ id: 's1', ...dto, organizationId: orgId });

      const result = await service.create(dto, orgId);
      expect(result.title).toBe('Keynote');
    });

    it('should create a session with optional speaker', async () => {
      const dto = {
        title: 'Workshop',
        startTime: '2024-06-15T14:00:00Z',
        endTime: '2024-06-15T16:00:00Z',
        eventId: 'event-1',
        speakerId: 'speaker-1',
      };
      mockPrisma.session.create.mockResolvedValue({ id: 's2', ...dto, organizationId: orgId });

      await service.create(dto, orgId);
      expect(mockPrisma.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ speakerId: 'speaker-1' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated sessions', async () => {
      mockPrisma.session.findMany.mockResolvedValue([]);
      mockPrisma.session.count.mockResolvedValue(0);

      const result = await service.findAll(orgId);
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return session when found', async () => {
      mockPrisma.session.findFirst.mockResolvedValue({ id: 's1', title: 'Keynote', speaker: {}, event: {} });
      const result = await service.findOne('s1', orgId);
      expect(result.title).toBe('Keynote');
    });

    it('should throw NotFoundException when session not found', async () => {
      mockPrisma.session.findFirst.mockResolvedValue(null);
      await expect(service.findOne('missing', orgId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update session title only', async () => {
      mockPrisma.session.findFirst.mockResolvedValue({ id: 's1', organizationId: orgId });
      mockPrisma.session.update.mockResolvedValue({ id: 's1', title: 'Updated' });

      const result = await service.update('s1', { title: 'Updated' }, orgId);
      expect(result.title).toBe('Updated');
      expect(mockPrisma.session.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { title: 'Updated' },
      });
    });

    it('should update session with all optional fields', async () => {
      mockPrisma.session.findFirst.mockResolvedValue({ id: 's1', organizationId: orgId });
      const dto = {
        title: 'New Title',
        description: 'Desc',
        startTime: '2024-07-01T09:00:00Z',
        endTime: '2024-07-01T10:00:00Z',
        speakerId: 'sp2',
      };
      mockPrisma.session.update.mockResolvedValue({ id: 's1', ...dto });

      await service.update('s1', dto, orgId);
      expect(mockPrisma.session.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: expect.objectContaining({
          title: 'New Title',
          description: 'Desc',
          speakerId: 'sp2',
        }),
      });
    });

    it('should throw NotFoundException when updating non-existent session', async () => {
      mockPrisma.session.findFirst.mockResolvedValue(null);
      await expect(service.update('missing', { title: 'X' }, orgId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.session.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a session', async () => {
      mockPrisma.session.findFirst.mockResolvedValue({ id: 's1', organizationId: orgId });
      mockPrisma.session.delete.mockResolvedValue({ id: 's1' });

      const result = await service.remove('s1', orgId);
      expect(result.deleted).toBe(true);
    });
  });
});
