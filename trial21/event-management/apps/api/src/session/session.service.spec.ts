import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SessionService } from './session.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  event: { findFirst: jest.fn() },
  eventSession: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(SessionService);
  });

  it('should create a session within event window', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({
      id: 'e1', startDate: new Date('2025-06-01T08:00:00Z'), endDate: new Date('2025-06-01T20:00:00Z'),
    });
    mockPrisma.eventSession.create.mockResolvedValue({ id: 's1', title: 'Workshop' });

    const result = await service.create('e1', {
      title: 'Workshop',
      startTime: '2025-06-01T10:00:00Z',
      endTime: '2025-06-01T12:00:00Z',
    }, 'org1');
    expect(result.title).toBe('Workshop');
  });

  it('should reject session outside event window', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({
      id: 'e1', startDate: new Date('2025-06-01T08:00:00Z'), endDate: new Date('2025-06-01T20:00:00Z'),
    });
    await expect(
      service.create('e1', {
        title: 'Late', startTime: '2025-06-02T10:00:00Z', endTime: '2025-06-02T12:00:00Z',
      }, 'org1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject session end before start', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({
      id: 'e1', startDate: new Date('2025-06-01T08:00:00Z'), endDate: new Date('2025-06-01T20:00:00Z'),
    });
    await expect(
      service.create('e1', {
        title: 'Bad', startTime: '2025-06-01T14:00:00Z', endTime: '2025-06-01T10:00:00Z',
      }, 'org1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw when event not found', async () => {
    mockPrisma.event.findFirst.mockResolvedValue(null);
    await expect(
      service.findAll('missing', 'org1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should find session by id', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1' });
    mockPrisma.eventSession.findFirst.mockResolvedValue({ id: 's1', title: 'Found' });
    const result = await service.findOne('e1', 's1', 'org1');
    expect(result.title).toBe('Found');
  });

  it('should throw when session not found', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1' });
    mockPrisma.eventSession.findFirst.mockResolvedValue(null);
    await expect(service.findOne('e1', 'missing', 'org1')).rejects.toThrow(NotFoundException);
  });
});
