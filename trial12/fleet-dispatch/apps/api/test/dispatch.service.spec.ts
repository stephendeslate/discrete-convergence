import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DispatchService } from '../src/dispatch/dispatch.service';
import { PrismaService } from '../src/infra/prisma.service';

describe('DispatchService', () => {
  let service: DispatchService;
  let prisma: {
    dispatch: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const tenantId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    prisma = {
      dispatch: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DispatchService>(DispatchService);
  });

  describe('create', () => {
    it('should create a dispatch', async () => {
      const dto = {
        referenceNumber: 'REF-001',
        pickupAddress: '123 Start St',
        deliveryAddress: '456 End Ave',
        cost: 100.50,
        weight: 250.00,
      };
      const expected = { id: '1', ...dto, tenantId };
      prisma.dispatch.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto);

      expect(result).toEqual(expected);
      expect(prisma.dispatch.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ tenantId }) }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated dispatches', async () => {
      const dispatches = [{ id: '1', tenantId }, { id: '2', tenantId }];
      prisma.dispatch.findMany.mockResolvedValue(dispatches);

      const result = await service.findAll(tenantId, 1, 10);

      expect(result).toEqual(dispatches);
      expect(prisma.dispatch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should clamp page size to MAX_PAGE_SIZE', async () => {
      prisma.dispatch.findMany.mockResolvedValue([]);

      await service.findAll(tenantId, 1, 500);

      expect(prisma.dispatch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a dispatch by id', async () => {
      const dispatch = { id: '1', tenantId };
      prisma.dispatch.findUnique.mockResolvedValue(dispatch);

      const result = await service.findOne(tenantId, '1');

      expect(result).toEqual(dispatch);
      expect(prisma.dispatch.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
    });

    it('should throw NotFoundException when dispatch not found', async () => {
      prisma.dispatch.findUnique.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'missing')).rejects.toThrow(NotFoundException);
      expect(prisma.dispatch.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'missing' } }),
      );
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      prisma.dispatch.findUnique.mockResolvedValue({ id: '1', tenantId: 'other' });

      await expect(service.findOne(tenantId, '1')).rejects.toThrow(NotFoundException);
      expect(prisma.dispatch.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
    });
  });

  describe('update', () => {
    it('should update a dispatch', async () => {
      prisma.dispatch.findUnique.mockResolvedValue({ id: '1', tenantId });
      prisma.dispatch.update.mockResolvedValue({ id: '1', tenantId, status: 'ASSIGNED' });

      const result = await service.update(tenantId, '1', { status: 'ASSIGNED' });

      expect(result.status).toBe('ASSIGNED');
      expect(prisma.dispatch.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
    });

    it('should throw NotFoundException when updating non-existent dispatch', async () => {
      prisma.dispatch.findUnique.mockResolvedValue(null);

      await expect(service.update(tenantId, 'bad', { status: 'ASSIGNED' })).rejects.toThrow(NotFoundException);
      expect(prisma.dispatch.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'bad' } }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a dispatch', async () => {
      prisma.dispatch.findUnique.mockResolvedValue({ id: '1', tenantId });
      prisma.dispatch.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove(tenantId, '1');

      expect(result).toEqual({ id: '1' });
      expect(prisma.dispatch.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException when deleting non-existent dispatch', async () => {
      prisma.dispatch.findUnique.mockResolvedValue(null);

      await expect(service.remove(tenantId, 'bad')).rejects.toThrow(NotFoundException);
      expect(prisma.dispatch.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'bad' } }),
      );
    });
  });
});
