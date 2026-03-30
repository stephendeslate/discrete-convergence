import { Test } from '@nestjs/testing';
import { DataSourceController } from './data-source.controller';
import { DataSourceService } from './data-source.service';
import { RequestWithUser } from '../common/request-with-user';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockReq = {
  user: { id: 'user-1', email: 'test@test.com', role: 'ADMIN', tenantId: 'tenant-1' },
} as unknown as RequestWithUser;

describe('DataSourceController', () => {
  let controller: DataSourceController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [DataSourceController],
      providers: [{ provide: DataSourceService, useValue: mockService }],
    }).compile();

    controller = module.get(DataSourceController);
    jest.clearAllMocks();
  });

  it('should call findAll with tenant from request', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0 });

    await controller.findAll(mockReq, {});

    expect(mockService.findAll).toHaveBeenCalledWith('tenant-1', undefined, undefined);
  });

  it('should call findOne with id and tenant', async () => {
    mockService.findOne.mockResolvedValue({ id: 'ds1' });

    await controller.findOne('ds1', mockReq);

    expect(mockService.findOne).toHaveBeenCalledWith('ds1', 'tenant-1');
  });

  it('should call create with dto, tenant, and user', async () => {
    mockService.create.mockResolvedValue({ id: 'ds1' });

    await controller.create({ name: 'DB', type: 'POSTGRESQL' }, mockReq);

    expect(mockService.create).toHaveBeenCalledWith(
      { name: 'DB', type: 'POSTGRESQL' },
      'tenant-1',
      'user-1',
    );
  });

  it('should call remove with id and tenant', async () => {
    mockService.remove.mockResolvedValue(undefined);

    await controller.remove('ds1', mockReq);

    expect(mockService.remove).toHaveBeenCalledWith('ds1', 'tenant-1');
  });
});
