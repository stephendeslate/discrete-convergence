// TRACED:EM-TEST-004 — event service unit test with mocked Prisma
import { EventService } from '../src/event/event.service';
import { PrismaService } from '../src/common/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('EventService', () => {
  let service: EventService;
  let prisma: {
    event: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      event: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new EventService(prisma as unknown as PrismaService);
  });

  describe('findOne', () => {
    it('should throw NotFoundException when event not found', async () => {
      prisma.event.findFirst.mockResolvedValue(null);
      await expect(service.findOne('id', 'org')).rejects.toThrow(NotFoundException);
    });

    it('should return event when found', async () => {
      const mockEvent = { id: '1', title: 'Test', organizationId: 'org' };
      prisma.event.findFirst.mockResolvedValue(mockEvent);
      const result = await service.findOne('1', 'org');
      expect(result).toEqual(mockEvent);
    });
  });

  describe('publish', () => {
    it('should only allow publishing draft events', async () => {
      prisma.event.findFirst.mockResolvedValue({ id: '1', status: 'PUBLISHED', organizationId: 'org' });
      await expect(service.publish('1', 'org')).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should not allow cancelling completed events', async () => {
      prisma.event.findFirst.mockResolvedValue({ id: '1', status: 'COMPLETED', organizationId: 'org' });
      await expect(service.cancel('1', 'org')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);
      const result = await service.findAll('org', 1, 10);
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});
