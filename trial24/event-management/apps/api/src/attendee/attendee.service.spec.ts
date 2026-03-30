// TRACED:ATTENDEE-SERVICE-SPEC
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { PrismaService } from '../infra/prisma.module';

const mockPrisma = {
  attendee: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  },
};

describe('AttendeeService', () => {
  let service: AttendeeService;
  const orgId = '00000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendeeService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AttendeeService>(AttendeeService);
  });

  describe('create', () => {
    it('should create an attendee with organizationId', async () => {
      const dto = { name: 'John Doe', email: 'john@test.com', ticketId: 't1', eventId: 'e1' };
      mockPrisma.attendee.create.mockResolvedValue({ id: 'a1', ...dto, organizationId: orgId });

      const result = await service.create(dto, orgId);
      expect(result.name).toBe('John Doe');
      expect(result.organizationId).toBe(orgId);
      expect(mockPrisma.attendee.create).toHaveBeenCalledWith({
        data: { ...dto, organizationId: orgId },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated attendees', async () => {
      mockPrisma.attendee.findMany.mockResolvedValue([{ id: 'a1' }]);
      mockPrisma.attendee.count.mockResolvedValue(1);

      const result = await service.findAll(orgId, 1, 10);
      expect(result.meta.total).toBe(1);
      expect(mockPrisma.attendee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { organizationId: orgId } }),
      );
    });

    it('should return empty list when no attendees exist', async () => {
      mockPrisma.attendee.findMany.mockResolvedValue([]);
      mockPrisma.attendee.count.mockResolvedValue(0);

      const result = await service.findAll(orgId, 1, 10);
      expect(result.meta.total).toBe(0);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return attendee when found', async () => {
      mockPrisma.attendee.findFirst.mockResolvedValue({ id: 'a1', name: 'John', ticket: {}, event: {} });
      const result = await service.findOne('a1', orgId);
      expect(result.name).toBe('John');
      expect(result.id).toBe('a1');
    });

    it('should throw NotFoundException when attendee not found (error path)', async () => {
      mockPrisma.attendee.findFirst.mockResolvedValue(null);
      await expect(service.findOne('missing', orgId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.attendee.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'missing', organizationId: orgId } }),
      );
    });
  });

  describe('remove', () => {
    it('should delete an attendee', async () => {
      mockPrisma.attendee.findFirst.mockResolvedValue({ id: 'a1', organizationId: orgId });
      mockPrisma.attendee.delete.mockResolvedValue({ id: 'a1' });

      const result = await service.remove('a1', orgId);
      expect(result.deleted).toBe(true);
      expect(mockPrisma.attendee.delete).toHaveBeenCalledWith({ where: { id: 'a1' } });
    });

    it('should throw NotFoundException when removing non-existent attendee (error path)', async () => {
      mockPrisma.attendee.findFirst.mockResolvedValue(null);
      await expect(service.remove('missing', orgId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.attendee.delete).not.toHaveBeenCalled();
    });
  });
});
