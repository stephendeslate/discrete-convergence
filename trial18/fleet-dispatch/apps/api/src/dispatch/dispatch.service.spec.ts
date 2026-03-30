import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { PrismaService } from '../infra/prisma.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';

jest.mock('@fleet-dispatch/shared', () => ({
  parsePagination: jest.fn().mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
}));

const mockPrisma = {
  dispatch: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $executeRaw: jest.fn(),
};

describe('DispatchService', () => {
  let service: DispatchService;
  const tenantId = 'tenant-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<DispatchService>(DispatchService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a dispatch with tenantId', async () => {
      const dto = { title: 'Test Dispatch', description: 'desc' };
      const created = { id: 'd-1', ...dto, tenantId };
      mockPrisma.dispatch.create.mockResolvedValue(created);

      const result = await service.create(tenantId, dto as CreateDispatchDto);

      expect(result).toEqual(created);
      expect(mockPrisma.dispatch.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ title: 'Test Dispatch', tenantId }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated dispatches', async () => {
      const dispatches = [{ id: 'd-1', tenantId }];
      mockPrisma.dispatch.findMany.mockResolvedValue(dispatches);
      mockPrisma.dispatch.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId);

      expect(result).toEqual(expect.objectContaining({ data: dispatches, total: 1, page: 1, pageSize: 10 }));
      expect(mockPrisma.dispatch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId }, skip: 0, take: 10 }),
      );
      expect(mockPrisma.dispatch.count).toHaveBeenCalledWith({ where: { tenantId } });
    });
  });

  describe('findOne', () => {
    it('should return dispatch when found with matching tenantId', async () => {
      const dispatch = { id: 'd-1', tenantId };
      mockPrisma.dispatch.findUnique.mockResolvedValue(dispatch);

      const result = await service.findOne(tenantId, 'd-1');

      expect(result).toEqual(dispatch);
      expect(mockPrisma.dispatch.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'd-1' } }),
      );
    });

    it('should throw NotFoundException when dispatch not found', async () => {
      mockPrisma.dispatch.findUnique.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'd-999')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dispatch.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'd-999' } }),
      );
    });

    it('should throw NotFoundException when tenantId does not match', async () => {
      mockPrisma.dispatch.findUnique.mockResolvedValue({ id: 'd-1', tenantId: 'other-tenant' });

      await expect(service.findOne(tenantId, 'd-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dispatch.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'd-1' } }),
      );
    });
  });

  describe('update', () => {
    it('should update dispatch after verifying ownership', async () => {
      const dispatch = { id: 'd-1', tenantId };
      mockPrisma.dispatch.findUnique.mockResolvedValue(dispatch);
      mockPrisma.dispatch.update.mockResolvedValue({ ...dispatch, title: 'Updated' });

      await service.update(tenantId, 'd-1', { title: 'Updated' } as UpdateDispatchDto);

      expect(mockPrisma.dispatch.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'd-1' } }),
      );
      expect(mockPrisma.dispatch.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'd-1' } }),
      );
    });
  });
});
