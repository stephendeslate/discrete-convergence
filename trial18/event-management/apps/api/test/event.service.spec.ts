import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventService } from '../src/event/event.service';
import { PrismaService } from '../src/infra/prisma.service';

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
    $executeRaw: jest.Mock;
  };

  const tenantId = 'tenant-1';

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

  it('should create an event', async () => {
    const dto = { title: 'Test Event', date: '2025-06-01T10:00:00Z' };
    const mockEvent = { id: '1', ...dto, tenantId };
    prisma.event.create.mockResolvedValue(mockEvent);

    const result = await service.create(tenantId, dto);
    expect(result.id).toBe('1');
    expect(prisma.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: 'Test Event', tenantId }),
      }),
    );
  });

  it('should return paginated events', async () => {
    const mockEvents = [{ id: '1', title: 'Event 1' }];
    prisma.event.findMany.mockResolvedValue(mockEvents);
    prisma.event.count.mockResolvedValue(1);

    const result = await service.findAll(tenantId, 1, 20);
    expect(result.data).toEqual(mockEvents);
    expect(result.total).toBe(1);
    expect(prisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId },
      }),
    );
  });

  it('should find one event by id and tenant', async () => {
    const mockEvent = { id: '1', title: 'Found', tenantId };
    prisma.event.findFirst.mockResolvedValue(mockEvent);

    const result = await service.findOne(tenantId, '1');
    expect(result.title).toBe('Found');
    expect(prisma.event.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '1', tenantId },
      }),
    );
  });

  it('should throw NotFoundException when event not found', async () => {
    prisma.event.findFirst.mockResolvedValue(null);
    await expect(service.findOne(tenantId, 'nonexistent')).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.event.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'nonexistent', tenantId },
      }),
    );
  });

  it('should update an event', async () => {
    prisma.event.findFirst.mockResolvedValue({ id: '1', tenantId });
    prisma.event.update.mockResolvedValue({ id: '1', title: 'Updated' });

    const result = await service.update(tenantId, '1', { title: 'Updated' });
    expect(result.title).toBe('Updated');
    expect(prisma.event.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '1' },
        data: expect.objectContaining({ title: 'Updated' }),
      }),
    );
  });

  it('should delete an event', async () => {
    prisma.event.findFirst.mockResolvedValue({ id: '1', tenantId });
    prisma.event.delete.mockResolvedValue({ id: '1' });

    await service.remove(tenantId, '1');
    expect(prisma.event.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should set tenant context using $executeRaw', async () => {
    prisma.$executeRaw.mockResolvedValue(undefined);
    await service.setTenantContext(tenantId);
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });
});
