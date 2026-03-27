import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { DataSourceController } from './data-source.controller';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

describe('DataSourceController', () => {
  let controller: DataSourceController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    testConnection: jest.Mock;
    sync: jest.Mock;
  };

  const mockReq = { user: { tenantId: 'tenant-1' } } as unknown as Request;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      testConnection: jest.fn(),
      sync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataSourceController],
      providers: [{ provide: DataSourceService, useValue: service }],
    }).compile();

    controller = module.get<DataSourceController>(DataSourceController);
  });

  it('should call create with tenantId and dto', async () => {
    const dto = { name: 'My DS', type: 'POSTGRESQL' };
    service.create.mockResolvedValue({ id: '1', ...dto });

    await controller.create(mockReq, dto as unknown as CreateDataSourceDto);

    expect(service.create).toHaveBeenCalledWith('tenant-1', dto);
  });

  it('should call findAll with tenantId and pagination', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: {} });

    await controller.findAll(mockReq, { page: 1, pageSize: 20 });

    expect(service.findAll).toHaveBeenCalledWith('tenant-1', 1, 20);
  });

  it('should call findOne with tenantId and id', async () => {
    service.findOne.mockResolvedValue({ id: 'ds-1' });

    await controller.findOne(mockReq, 'ds-1');

    expect(service.findOne).toHaveBeenCalledWith('tenant-1', 'ds-1');
  });

  it('should call update with tenantId, id, and dto', async () => {
    const dto = { name: 'Updated DS' };
    service.update.mockResolvedValue({ id: 'ds-1', name: 'Updated DS' });

    await controller.update(mockReq, 'ds-1', dto as unknown as UpdateDataSourceDto);

    expect(service.update).toHaveBeenCalledWith('tenant-1', 'ds-1', dto);
  });

  it('should call remove with tenantId and id', async () => {
    service.remove.mockResolvedValue({ id: 'ds-1' });

    await controller.remove(mockReq, 'ds-1');

    expect(service.remove).toHaveBeenCalledWith('tenant-1', 'ds-1');
  });

  it('should call testConnection with tenantId and id', async () => {
    service.testConnection.mockResolvedValue({ success: true, message: 'OK' });

    await controller.testConnection(mockReq, 'ds-1');

    expect(service.testConnection).toHaveBeenCalledWith('tenant-1', 'ds-1');
  });

  it('should call sync with tenantId and id', async () => {
    service.sync.mockResolvedValue({ syncRunId: 'sr-1', status: 'COMPLETED' });

    await controller.sync(mockReq, 'ds-1');

    expect(service.sync).toHaveBeenCalledWith('tenant-1', 'ds-1');
  });
});
