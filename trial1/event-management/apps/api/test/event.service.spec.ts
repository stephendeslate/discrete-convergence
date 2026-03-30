import { EventService } from '../src/event/event.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('EventService', () => {
  let service: EventService;
  const mockPrisma = {
    $executeRaw: jest.fn(),
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(() => {
    service = new EventService(mockPrisma as never);
    jest.clearAllMocks();
  });

  it('creates event in DRAFT status', async () => {
    mockPrisma.event.create.mockResolvedValue({ id: '1', status: 'DRAFT' });
    const result = await service.create('org1', {
      name: 'Test', slug: 'test', startDate: '2026-06-01T00:00:00Z', endDate: '2026-06-02T00:00:00Z', timezone: 'UTC',
    });
    expect(result.status).toBe('DRAFT');
  });

  it('throws NotFoundException when event not found', async () => {
    mockPrisma.event.findFirst.mockResolvedValue(null);
    await expect(service.findOne('org1', 'bad-id')).rejects.toThrow(NotFoundException);
  });

  it('validates status transitions', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({ id: '1', status: 'COMPLETED', organizationId: 'org1' });
    await expect(service.transitionStatus('org1', '1', 'DRAFT')).rejects.toThrow(BadRequestException);
  });

  it('allows valid transition from DRAFT to PUBLISHED', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({ id: '1', status: 'DRAFT', organizationId: 'org1' });
    mockPrisma.event.update.mockResolvedValue({ id: '1', status: 'PUBLISHED' });
    const result = await service.transitionStatus('org1', '1', 'PUBLISHED');
    expect(result.status).toBe('PUBLISHED');
  });
});
