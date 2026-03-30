import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from '../src/event/event.service';
import { PrismaService } from '../src/infra/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventStatus } from '@prisma/client';

// TRACED:EM-TEST-007 — Event service unit tests with mocked Prisma

describe('EventService', () => {
  let service: EventService;
  let prisma: {
    event: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    $executeRaw: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      event: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $executeRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  describe('create', () => {
    it('should create an event', async () => {
      const dto = {
        title: 'Test Event',
        slug: 'test-event',
        startDate: '2026-06-01T00:00:00Z',
        endDate: '2026-06-02T00:00:00Z',
      };
      const expected = { id: '1', ...dto, status: EventStatus.DRAFT };
      prisma.event.create.mockResolvedValue(expected);

      const result = await service.create(dto, 'org-1');
      expect(result).toEqual(expected);
      expect(prisma.event.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return event when found', async () => {
      const event = {
        id: '1',
        organizationId: 'org-1',
        status: EventStatus.DRAFT,
      };
      prisma.event.findUnique.mockResolvedValue(event);

      const result = await service.findOne('1', 'org-1');
      expect(result).toEqual(event);
    });

    it('should throw NotFoundException when event not found', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999', 'org-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for wrong organization', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: '1',
        organizationId: 'org-2',
      });

      await expect(service.findOne('1', 'org-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('publish', () => {
    it('should publish a draft event', async () => {
      const event = {
        id: '1',
        organizationId: 'org-1',
        status: EventStatus.DRAFT,
      };
      prisma.event.findUnique.mockResolvedValue(event);
      prisma.event.update.mockResolvedValue({
        ...event,
        status: EventStatus.PUBLISHED,
      });

      const result = await service.publish('1', 'org-1');
      expect(result.status).toBe(EventStatus.PUBLISHED);
    });

    it('should reject publishing a cancelled event', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: '1',
        organizationId: 'org-1',
        status: EventStatus.CANCELLED,
      });

      await expect(service.publish('1', 'org-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a draft event', async () => {
      const event = {
        id: '1',
        organizationId: 'org-1',
        status: EventStatus.DRAFT,
      };
      prisma.event.findUnique.mockResolvedValue(event);
      prisma.event.update.mockResolvedValue({
        ...event,
        status: EventStatus.CANCELLED,
      });
      prisma.$executeRaw.mockResolvedValue(1);

      const result = await service.cancel('1', 'org-1', 'user-1');
      expect(result.status).toBe(EventStatus.CANCELLED);
    });

    it('should reject cancelling a completed event', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: '1',
        organizationId: 'org-1',
        status: EventStatus.COMPLETED,
      });

      await expect(service.cancel('1', 'org-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should reject updating completed events', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: '1',
        organizationId: 'org-1',
        status: EventStatus.COMPLETED,
      });

      await expect(
        service.update('1', { title: 'New Title' }, 'org-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
