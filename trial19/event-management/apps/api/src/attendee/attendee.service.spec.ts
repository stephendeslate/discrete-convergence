import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  attendee: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('AttendeeService', () => {
  let service: AttendeeService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AttendeeService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(AttendeeService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated attendees for a tenant', async () => {
      const attendees = [{ id: 'a-1', name: 'John', tenantId: 'tenant-1' }];
      mockPrisma.attendee.findMany.mockResolvedValue(attendees);
      mockPrisma.attendee.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 10);
      expect(mockPrisma.attendee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
      expect(result.data).toEqual(attendees);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return an attendee by id and tenant', async () => {
      const attendee = { id: 'a-1', name: 'John', tenantId: 'tenant-1' };
      mockPrisma.attendee.findFirst.mockResolvedValue(attendee);

      const result = await service.findOne('a-1', 'tenant-1');
      expect(mockPrisma.attendee.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'a-1', tenantId: 'tenant-1' } }),
      );
      expect(result).toEqual(attendee);
    });

    it('should throw NotFoundException when attendee not found', async () => {
      mockPrisma.attendee.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.attendee.findFirst).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create an attendee with tenant scope', async () => {
      const dto = { name: 'Jane', email: 'jane@test.com' };
      mockPrisma.attendee.create.mockResolvedValue({ id: 'a-new', ...dto, tenantId: 'tenant-1' });

      const result = await service.create(dto, 'tenant-1');
      expect(mockPrisma.attendee.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'Jane', tenantId: 'tenant-1' }),
      });
      expect(result.name).toBe('Jane');
    });
  });

  describe('update', () => {
    it('should update an existing attendee', async () => {
      mockPrisma.attendee.findFirst.mockResolvedValue({ id: 'a-1', tenantId: 'tenant-1' });
      mockPrisma.attendee.update.mockResolvedValue({ id: 'a-1', name: 'Updated', tenantId: 'tenant-1' });

      const result = await service.update('a-1', { name: 'Updated' }, 'tenant-1');
      expect(mockPrisma.attendee.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'a-1' } }),
      );
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete an attendee', async () => {
      mockPrisma.attendee.findFirst.mockResolvedValue({ id: 'a-1', tenantId: 'tenant-1' });
      mockPrisma.attendee.delete.mockResolvedValue({ id: 'a-1' });

      await service.remove('a-1', 'tenant-1');
      expect(mockPrisma.attendee.delete).toHaveBeenCalledWith({ where: { id: 'a-1' } });
      expect(mockPrisma.attendee.findFirst).toHaveBeenCalled();
    });
  });
});
