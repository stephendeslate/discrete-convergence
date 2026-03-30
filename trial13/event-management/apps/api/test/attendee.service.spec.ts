import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AttendeeService } from '../src/attendee/attendee.service';
import { PrismaService } from '../src/infra/prisma.service';

const mockPrisma = {
  attendee: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('AttendeeService', () => {
  let service: AttendeeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendeeService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AttendeeService>(AttendeeService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an attendee with tenant scoping', async () => {
      const dto = { name: 'Jane Doe', email: 'jane@test.com', phone: '+1-555-0100' };
      const expected = { id: '1', name: 'Jane Doe', email: 'jane@test.com', tenantId: 'tenant-1' };
      mockPrisma.attendee.create.mockResolvedValue(expected);

      const result = await service.create('tenant-1', dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.attendee.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'Jane Doe', email: 'jane@test.com', tenantId: 'tenant-1' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated attendees', async () => {
      const attendees = [{ id: '1', name: 'Jane', tenantId: 'tenant-1' }];
      mockPrisma.attendee.findMany.mockResolvedValue(attendees);
      mockPrisma.attendee.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 10);

      expect(result.data).toEqual(attendees);
      expect(mockPrisma.attendee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return attendee by id and tenantId', async () => {
      const attendee = { id: '1', name: 'Jane', tenantId: 'tenant-1' };
      mockPrisma.attendee.findFirst.mockResolvedValue(attendee);

      const result = await service.findOne('tenant-1', '1');

      expect(result).toEqual(attendee);
      expect(mockPrisma.attendee.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1', tenantId: 'tenant-1' } }),
      );
    });

    it('should throw NotFoundException when attendee not found', async () => {
      mockPrisma.attendee.findFirst.mockResolvedValue(null);

      await expect(service.findOne('tenant-1', 'missing')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.attendee.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'missing', tenantId: 'tenant-1' } }),
      );
    });
  });

  describe('update', () => {
    it('should update attendee', async () => {
      mockPrisma.attendee.findFirst.mockResolvedValue({ id: '1', name: 'Old', tenantId: 'tenant-1' });
      mockPrisma.attendee.update.mockResolvedValue({ id: '1', name: 'New', tenantId: 'tenant-1' });

      const result = await service.update('tenant-1', '1', { name: 'New' });

      expect(result.name).toBe('New');
      expect(mockPrisma.attendee.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
    });

    it('should throw NotFoundException for non-existent attendee update', async () => {
      mockPrisma.attendee.findFirst.mockResolvedValue(null);

      await expect(service.update('tenant-1', 'missing', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an attendee', async () => {
      mockPrisma.attendee.findFirst.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });
      mockPrisma.attendee.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('tenant-1', '1');

      expect(result.id).toBe('1');
      expect(mockPrisma.attendee.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException when deleting non-existent attendee', async () => {
      mockPrisma.attendee.findFirst.mockResolvedValue(null);

      await expect(service.remove('tenant-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });
});
