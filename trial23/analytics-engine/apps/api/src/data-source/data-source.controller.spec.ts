import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceController } from './data-source.controller';
import { DataSourceService } from './data-source.service';
import { RequestWithUser } from '../common/auth-utils';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  sync: jest.fn(),
  getSyncHistory: jest.fn(),
};

const mockReq = {
  user: { userId: 'u1', email: 'a@b.com', tenantId: 't1', role: 'user' },
} as unknown as RequestWithUser;

describe('DataSourceController', () => {
  let controller: DataSourceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataSourceController],
      providers: [{ provide: DataSourceService, useValue: mockService }],
    }).compile();

    controller = module.get<DataSourceController>(DataSourceController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(DataSourceController);
  });

  describe('findAll', () => {
    it('should delegate to service with tenantId and pagination', async () => {
      const expected = { data: [], total: 0, page: 1, limit: 20 };
      mockService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(mockReq, { page: 1, limit: 20 });

      expect(result).toEqual(expected);
      expect(mockService.findAll).toHaveBeenCalledWith('t1', 1, 20);
    });
  });

  describe('findOne', () => {
    it('should delegate to service with id and tenantId', async () => {
      const source = { id: '1', name: 'API' };
      mockService.findOne.mockResolvedValue(source);

      const result = await controller.findOne(mockReq, '1');

      expect(result).toEqual(source);
      expect(mockService.findOne).toHaveBeenCalledWith('1', 't1');
    });
  });

  describe('sync', () => {
    it('should delegate to service with id and tenantId', async () => {
      const synced = { id: '1', lastSyncAt: new Date() };
      mockService.sync.mockResolvedValue(synced);

      const result = await controller.sync(mockReq, '1');

      expect(result).toEqual(synced);
      expect(mockService.sync).toHaveBeenCalledWith('1', 't1');
    });
  });

  describe('remove', () => {
    it('should delegate to service with id and tenantId', async () => {
      mockService.remove.mockResolvedValue({ id: '1' });

      const result = await controller.remove(mockReq, '1');

      expect(result).toEqual({ id: '1' });
      expect(mockService.remove).toHaveBeenCalledWith('1', 't1');
    });
  });
});
