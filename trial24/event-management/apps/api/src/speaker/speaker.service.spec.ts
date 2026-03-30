// TRACED:SPEAKER-SERVICE-SPEC
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SpeakerService } from './speaker.service';
import { PrismaService } from '../infra/prisma.module';

const mockPrisma = {
  speaker: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('SpeakerService', () => {
  let service: SpeakerService;
  const orgId = '00000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpeakerService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SpeakerService>(SpeakerService);
  });

  describe('create', () => {
    it('should create a speaker with organizationId', async () => {
      const dto = { name: 'Jane Speaker', email: 'jane@test.com', bio: 'Expert' };
      mockPrisma.speaker.create.mockResolvedValue({ id: 's1', ...dto, organizationId: orgId });

      const result = await service.create(dto, orgId);
      expect(result.name).toBe('Jane Speaker');
      expect(result.organizationId).toBe(orgId);
      expect(mockPrisma.speaker.create).toHaveBeenCalledWith({
        data: { name: dto.name, email: dto.email, bio: dto.bio, organizationId: orgId },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated speakers', async () => {
      mockPrisma.speaker.findMany.mockResolvedValue([{ id: 's1' }]);
      mockPrisma.speaker.count.mockResolvedValue(1);

      const result = await service.findAll(orgId, 1, 10);
      expect(result.meta.total).toBe(1);
      expect(mockPrisma.speaker.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { organizationId: orgId } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return speaker when found', async () => {
      mockPrisma.speaker.findFirst.mockResolvedValue({ id: 's1', name: 'Jane', sessions: [] });
      const result = await service.findOne('s1', orgId);
      expect(result.name).toBe('Jane');
      expect(result.id).toBe('s1');
    });

    it('should throw NotFoundException when speaker not found (error path)', async () => {
      mockPrisma.speaker.findFirst.mockResolvedValue(null);
      await expect(service.findOne('missing', orgId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.speaker.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'missing', organizationId: orgId } }),
      );
    });
  });

  describe('update', () => {
    it('should update speaker name', async () => {
      mockPrisma.speaker.findFirst.mockResolvedValue({ id: 's1', organizationId: orgId });
      mockPrisma.speaker.update.mockResolvedValue({ id: 's1', name: 'Updated' });

      const result = await service.update('s1', { name: 'Updated' }, orgId);
      expect(result.name).toBe('Updated');
      expect(mockPrisma.speaker.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { name: 'Updated' },
      });
    });

    it('should update speaker with partial fields (only email)', async () => {
      mockPrisma.speaker.findFirst.mockResolvedValue({ id: 's1', organizationId: orgId });
      mockPrisma.speaker.update.mockResolvedValue({ id: 's1', email: 'new@test.com' });

      const result = await service.update('s1', { email: 'new@test.com' }, orgId);
      expect(result.email).toBe('new@test.com');
      expect(mockPrisma.speaker.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { email: 'new@test.com' },
      });
    });

    it('should throw NotFoundException when updating non-existent speaker (error path)', async () => {
      mockPrisma.speaker.findFirst.mockResolvedValue(null);
      await expect(service.update('missing', { name: 'X' }, orgId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.speaker.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a speaker', async () => {
      mockPrisma.speaker.findFirst.mockResolvedValue({ id: 's1', organizationId: orgId });
      mockPrisma.speaker.delete.mockResolvedValue({ id: 's1' });

      const result = await service.remove('s1', orgId);
      expect(result.deleted).toBe(true);
      expect(mockPrisma.speaker.delete).toHaveBeenCalledWith({ where: { id: 's1' } });
    });

    it('should throw NotFoundException when removing non-existent speaker (error path)', async () => {
      mockPrisma.speaker.findFirst.mockResolvedValue(null);
      await expect(service.remove('missing', orgId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.speaker.delete).not.toHaveBeenCalled();
    });
  });
});
