import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    publish: jest.Mock;
    archive: jest.Mock;
    remove: jest.Mock;
  };

  const mockReq = { user: { tenantId: 'tenant-1' } } as unknown as Request;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      publish: jest.fn(),
      archive: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: service }],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should call create with tenantId and dto', async () => {
    const dto = { name: 'Test Dashboard' };
    service.create.mockResolvedValue({ id: '1', ...dto });

    await controller.create(mockReq, dto as unknown as CreateDashboardDto);

    expect(service.create).toHaveBeenCalledWith('tenant-1', dto);
  });

  it('should call findAll with tenantId and pagination', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: {} });

    await controller.findAll(mockReq, { page: 1, pageSize: 10 });

    expect(service.findAll).toHaveBeenCalledWith('tenant-1', 1, 10);
  });

  it('should call findOne with tenantId and id', async () => {
    service.findOne.mockResolvedValue({ id: 'dash-1' });

    await controller.findOne(mockReq, 'dash-1');

    expect(service.findOne).toHaveBeenCalledWith('tenant-1', 'dash-1');
  });

  it('should call update with tenantId, id, and dto', async () => {
    const dto = { name: 'Updated' };
    service.update.mockResolvedValue({ id: 'dash-1', name: 'Updated' });

    await controller.update(mockReq, 'dash-1', dto as unknown as UpdateDashboardDto);

    expect(service.update).toHaveBeenCalledWith('tenant-1', 'dash-1', dto);
  });

  it('should call publish with tenantId and id', async () => {
    service.publish.mockResolvedValue({ id: 'dash-1', status: 'PUBLISHED' });

    await controller.publish(mockReq, 'dash-1');

    expect(service.publish).toHaveBeenCalledWith('tenant-1', 'dash-1');
  });

  it('should call archive with tenantId and id', async () => {
    service.archive.mockResolvedValue({ id: 'dash-1', status: 'ARCHIVED' });

    await controller.archive(mockReq, 'dash-1');

    expect(service.archive).toHaveBeenCalledWith('tenant-1', 'dash-1');
  });

  it('should call remove with tenantId and id', async () => {
    service.remove.mockResolvedValue({ id: 'dash-1' });

    await controller.remove(mockReq, 'dash-1');

    expect(service.remove).toHaveBeenCalledWith('tenant-1', 'dash-1');
  });
});
