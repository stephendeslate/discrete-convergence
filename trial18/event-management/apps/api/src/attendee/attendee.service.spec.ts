import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { PrismaService } from '../infra/prisma.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';

jest.mock('@event-management/shared', () => ({
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
}));

jest.mock('../common/pagination.utils', () => ({
  getPaginationParams: jest
    .fn()
    .mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
}));

const mockPrisma = {
  attendee: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
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

  const tenantId = 'tenant-1';

  describe('create', () => {
    it('should create an attendee with tenantId', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
      };
      const expected = { id: 'attendee-1', ...dto, tenantId };
      mockPrisma.attendee.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto as CreateAttendeeDto);

      expect(result).toEqual(expected);
      expect(mockPrisma.attendee.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          tenantId,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated attendees with count', async () => {
      const attendees = [{ id: 'attendee-1' }];
      mockPrisma.attendee.findMany.mockResolvedValue(attendees);
      mockPrisma.attendee.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId);

      expect(result).toEqual({
        data: attendees,
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
      expect(mockPrisma.attendee.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return attendee when found', async () => {
      const attendee = { id: 'attendee-1', tenantId };
      mockPrisma.attendee.findFirst.mockResolvedValue(attendee);

      const result = await service.findOne(tenantId, 'attendee-1');

      expect(result).toEqual(attendee);
      expect(mockPrisma.attendee.findFirst).toHaveBeenCalledWith({
        where: { id: 'attendee-1', tenantId },
        include: { registrations: true },
      });
    });

    it('should throw NotFoundException when attendee not found', async () => {
      mockPrisma.attendee.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.attendee.findFirst).toHaveBeenCalledWith({
        where: { id: 'missing', tenantId },
        include: { registrations: true },
      });
    });
  });

  describe('remove', () => {
    it('should find then delete the attendee', async () => {
      const attendee = { id: 'attendee-1', tenantId };
      mockPrisma.attendee.findFirst.mockResolvedValue(attendee);
      mockPrisma.attendee.delete.mockResolvedValue(attendee);

      await service.remove(tenantId, 'attendee-1');

      expect(mockPrisma.attendee.delete).toHaveBeenCalledWith({
        where: { id: 'attendee-1' },
      });
    });
  });
});
