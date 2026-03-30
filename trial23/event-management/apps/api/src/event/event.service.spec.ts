import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventService } from './event.service';
import { PrismaService } from '../infra/prisma.service';

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

  beforeEach(async () => {
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  it('should create an event with organization scoping', async () => {
    const dto = {
      name: 'Test Event',
      startDate: '2026-06-01T10:00:00Z',
      endDate: '2026-06-01T18:00:00Z',
    };
    const expected = { id: 'evt-1', ...dto, organizationId: 'org-1', status: 'DRAFT' };
    prisma.event.create.mockResolvedValue(expected);

    const result = await service.create('org-1', dto);
    expect(result).toEqual(expected);
    expect(prisma.event.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ organizationId: 'org-1', status: 'DRAFT' }),
    });
  });

  it('should return paginated events for an organization', async () => {
    prisma.event.findMany.mockResolvedValue([{ id: 'evt-1' }]);
    prisma.event.count.mockResolvedValue(1);

    const result = await service.findAll('org-1', 1, 10);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('should find one event by id and organizationId', async () => {
    const event = { id: 'evt-1', organizationId: 'org-1' };
    prisma.event.findFirst.mockResolvedValue(event);

    const result = await service.findOne('org-1', 'evt-1');
    expect(result).toEqual(event);
    expect(prisma.event.findFirst).toHaveBeenCalledWith({
      where: { id: 'evt-1', organizationId: 'org-1' },
    });
  });

  it('should throw NotFoundException when event not found', async () => {
    prisma.event.findFirst.mockResolvedValue(null);

    await expect(service.findOne('org-1', 'evt-999')).rejects.toThrow(NotFoundException);
  });

  it('should publish an event', async () => {
    const event = { id: 'evt-1', organizationId: 'org-1', status: 'DRAFT' };
    prisma.event.findFirst.mockResolvedValue(event);
    prisma.event.update.mockResolvedValue({ ...event, status: 'PUBLISHED' });

    const result = await service.publish('org-1', 'evt-1');
    expect(result.status).toBe('PUBLISHED');
    expect(prisma.event.update).toHaveBeenCalledWith({
      where: { id: 'evt-1' },
      data: { status: 'PUBLISHED' },
    });
  });

  it('should cancel an event', async () => {
    const event = { id: 'evt-1', organizationId: 'org-1', status: 'PUBLISHED' };
    prisma.event.findFirst.mockResolvedValue(event);
    prisma.event.update.mockResolvedValue({ ...event, status: 'CANCELLED' });

    const result = await service.cancel('org-1', 'evt-1');
    expect(result.status).toBe('CANCELLED');
  });

  it('should delete an event', async () => {
    const event = { id: 'evt-1', organizationId: 'org-1' };
    prisma.event.findFirst.mockResolvedValue(event);
    prisma.event.delete.mockResolvedValue(event);

    const result = await service.remove('org-1', 'evt-1');
    expect(result).toEqual(event);
  });
});
