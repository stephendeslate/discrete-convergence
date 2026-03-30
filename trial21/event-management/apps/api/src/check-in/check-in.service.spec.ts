import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  registration: {
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  checkIn: {
    create: jest.fn(),
    findFirst: jest.fn(),
  },
};

describe('CheckInService', () => {
  let service: CheckInService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CheckInService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(CheckInService);
  });

  describe('checkIn', () => {
    it('should check in a confirmed registration', async () => {
      mockPrisma.registration.findUnique.mockResolvedValue({ id: 'r1', status: 'CONFIRMED' });
      mockPrisma.registration.update.mockResolvedValue({ id: 'r1', status: 'CHECKED_IN' });
      mockPrisma.checkIn.create.mockResolvedValue({ id: 'c1', checkedInAt: new Date() });

      const result = await service.checkIn('r1');
      expect(result.status).toBe('checked_in');
      expect(result.checkedInAt).toBeDefined();
    });

    it('should return already_checked_in for idempotent scan', async () => {
      const now = new Date();
      mockPrisma.registration.findUnique.mockResolvedValue({ id: 'r1', status: 'CHECKED_IN' });
      mockPrisma.checkIn.findFirst.mockResolvedValue({ checkedInAt: now });

      const result = await service.checkIn('r1');
      expect(result.status).toBe('already_checked_in');
      expect(result.checkedInAt).toBe(now);
    });

    it('should reject check-in for cancelled registration', async () => {
      mockPrisma.registration.findUnique.mockResolvedValue({ id: 'r1', status: 'CANCELLED' });
      await expect(service.checkIn('r1')).rejects.toThrow(BadRequestException);
    });

    it('should throw when registration not found', async () => {
      mockPrisma.registration.findUnique.mockResolvedValue(null);
      await expect(service.checkIn('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return check-in statistics', async () => {
      mockPrisma.registration.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(60)
        .mockResolvedValueOnce(40);

      const result = await service.getStats('e1');
      expect(result.total).toBe(100);
      expect(result.checkedIn).toBe(60);
      expect(result.pending).toBe(40);
    });
  });
});
