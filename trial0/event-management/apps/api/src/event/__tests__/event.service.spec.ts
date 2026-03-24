// TRACED:EM-TEST-008 — Event service unit tests with mocked Prisma
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventService } from '../event.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

const mockPrisma = {
  event: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
};

describe('EventService', () => {
  let service: EventService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EventService(mockPrisma as never);
  });

  it('should create an event', async () => {
    mockPrisma.event.create.mockResolvedValue({ id: 'event-1', title: 'Test Event' });
    const result = await service.create(
      { title: 'Test Event', slug: 'test-event', startDate: '2024-06-01', endDate: '2024-06-02' },
      'org-1',
    );
    expect(result.title).toBe('Test Event');
  });

  it('should throw NotFoundException when event not found', async () => {
    mockPrisma.event.findFirst.mockResolvedValue(null);
    await expect(service.findOne('bad-id', 'org-1')).rejects.toThrow(NotFoundException);
  });

  it('should publish a DRAFT event', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1', status: 'DRAFT' });
    mockPrisma.event.update.mockResolvedValue({ id: 'e1', status: 'PUBLISHED' });
    const result = await service.publish('e1', 'org-1');
    expect(result.status).toBe('PUBLISHED');
  });

  it('should reject publishing non-DRAFT event', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1', status: 'PUBLISHED' });
    await expect(service.publish('e1', 'org-1')).rejects.toThrow(BadRequestException);
  });

  it('should reject editing completed events', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1', status: 'COMPLETED' });
    await expect(service.update('e1', { title: 'New' }, 'org-1')).rejects.toThrow(ForbiddenException);
  });

  it('should cancel non-completed events', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1', status: 'PUBLISHED' });
    mockPrisma.event.update.mockResolvedValue({ id: 'e1', status: 'CANCELLED' });
    const result = await service.cancel('e1', 'org-1');
    expect(result.status).toBe('CANCELLED');
  });

  it('should reject cancelling completed events', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1', status: 'COMPLETED' });
    await expect(service.cancel('e1', 'org-1')).rejects.toThrow(BadRequestException);
  });
});
