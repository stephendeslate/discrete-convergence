import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RegistrationService } from '../src/registration/registration.service';
import { PrismaService } from '../src/infra/prisma.service';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let prisma: {
    registration: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const tenantId = 'tenant-1';

  beforeEach(async () => {
    prisma = {
      registration: {
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
        RegistrationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
  });

  it('should create a registration', async () => {
    const dto = { eventId: 'e1', attendeeId: 'a1' };
    prisma.registration.create.mockResolvedValue({ id: '1', ...dto, tenantId, status: 'PENDING' });

    const result = await service.create(tenantId, dto);
    expect(result.status).toBe('PENDING');
    expect(prisma.registration.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ eventId: 'e1', attendeeId: 'a1', tenantId }),
      }),
    );
  });

  it('should return paginated registrations', async () => {
    prisma.registration.findMany.mockResolvedValue([{ id: '1' }]);
    prisma.registration.count.mockResolvedValue(1);

    const result = await service.findAll(tenantId);
    expect(result.data).toHaveLength(1);
    expect(prisma.registration.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId } }),
    );
  });

  it('should throw NotFoundException when registration not found', async () => {
    prisma.registration.findFirst.mockResolvedValue(null);
    await expect(service.findOne(tenantId, 'bad')).rejects.toThrow(NotFoundException);
    expect(prisma.registration.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'bad', tenantId } }),
    );
  });

  it('should update a registration status', async () => {
    prisma.registration.findFirst.mockResolvedValue({ id: '1', tenantId });
    prisma.registration.update.mockResolvedValue({ id: '1', status: 'CONFIRMED' });

    const result = await service.update(tenantId, '1', { status: 'CONFIRMED' });
    expect(result.status).toBe('CONFIRMED');
    expect(prisma.registration.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '1' },
        data: expect.objectContaining({ status: 'CONFIRMED' }),
      }),
    );
  });

  it('should delete a registration', async () => {
    prisma.registration.findFirst.mockResolvedValue({ id: '1', tenantId });
    prisma.registration.delete.mockResolvedValue({ id: '1' });

    await service.remove(tenantId, '1');
    expect(prisma.registration.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
