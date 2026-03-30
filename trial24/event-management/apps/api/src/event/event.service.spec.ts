// TRACED:EVENT-SERVICE-SPEC
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventService } from './event.service';
import { PrismaService } from '../infra/prisma.module';
import { EventStatusDto } from './dto';

const mockPrisma = {
  event: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('EventService', () => {
  let service: EventService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  const orgId = '00000000-0000-0000-0000-000000000001';

  describe('create', () => {
    it('should create an event with DRAFT status by default', async () => {
      const dto = {
        title: 'Test Event',
        startDate: '2024-06-15T09:00:00Z',
        endDate: '2024-06-17T17:00:00Z',
      };
      mockPrisma.event.create.mockResolvedValue({ id: 'e1', ...dto, status: 'DRAFT', organizationId: orgId });

      const result = await service.create(dto, orgId);
      expect(result.status).toBe('DRAFT');
      expect(mockPrisma.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ organizationId: orgId }),
        }),
      );
    });

    it('should create an event with specified status', async () => {
      const dto = {
        title: 'Published Event',
        startDate: '2024-06-15T09:00:00Z',
        endDate: '2024-06-17T17:00:00Z',
        status: EventStatusDto.PUBLISHED,
      };
      mockPrisma.event.create.mockResolvedValue({ id: 'e2', ...dto, organizationId: orgId });

      await service.create(dto, orgId);
      expect(mockPrisma.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PUBLISHED' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated events', async () => {
      mockPrisma.event.findMany.mockResolvedValue([{ id: 'e1' }]);
      mockPrisma.event.count.mockResolvedValue(1);

      const result = await service.findAll(orgId, 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should use default pagination when not specified', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      const result = await service.findAll(orgId);
      expect(result.meta.page).toBe(1);
      expect(result.meta.pageSize).toBe(20);
    });
  });

  describe('findOne', () => {
    it('should return event when found', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1', title: 'Test' });
      const result = await service.findOne('e1', orgId);
      expect(result.title).toBe('Test');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);
      await expect(service.findOne('missing', orgId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update event title only', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1', organizationId: orgId });
      mockPrisma.event.update.mockResolvedValue({ id: 'e1', title: 'Updated' });

      const result = await service.update('e1', { title: 'Updated' }, orgId);
      expect(result.title).toBe('Updated');
    });

    it('should update event with all optional fields', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1', organizationId: orgId });
      const dto = {
        title: 'New',
        description: 'Desc',
        startDate: '2024-07-01T09:00:00Z',
        endDate: '2024-07-02T17:00:00Z',
        status: EventStatusDto.PUBLISHED,
        venueId: 'v2',
      };
      mockPrisma.event.update.mockResolvedValue({ id: 'e1', ...dto });

      await service.update('e1', dto, orgId);
      expect(mockPrisma.event.update).toHaveBeenCalledWith({
        where: { id: 'e1' },
        data: expect.objectContaining({
          title: 'New',
          description: 'Desc',
          status: 'PUBLISHED',
          venueId: 'v2',
        }),
      });
    });

    it('should throw NotFoundException when updating non-existent event', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);
      await expect(service.update('missing', { title: 'X' }, orgId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.event.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete an event', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1', organizationId: orgId });
      mockPrisma.event.delete.mockResolvedValue({ id: 'e1' });

      const result = await service.remove('e1', orgId);
      expect(result.deleted).toBe(true);
    });

    it('should throw NotFoundException for missing event', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);
      await expect(service.remove('missing', orgId)).rejects.toThrow(NotFoundException);
    });
  });
});
