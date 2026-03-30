import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  const mockReq = {
    user: { sub: 'user-1', email: 'u@test.com', role: 'ADMIN', organizationId: 'org-1' },
  } as never;

  const mockRes = {
    setHeader: jest.fn(),
  } as never;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: service }],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should list dashboards', async () => {
    const paginated = { data: [], total: 0, page: 1, limit: 20 };
    service.findAll.mockResolvedValue(paginated);

    const result = await controller.findAll(mockReq, mockRes, {});
    expect(result).toEqual(paginated);
  });

  it('should create a dashboard', async () => {
    const dto = { name: 'New Dashboard' };
    const created = { id: 'dash-2', ...dto };
    service.create.mockResolvedValue(created);

    const result = await controller.create(mockReq, dto);
    expect(result).toEqual(created);
  });

  it('should delete a dashboard', async () => {
    const archived = { id: 'dash-1', status: 'ARCHIVED' };
    service.remove.mockResolvedValue(archived);

    const result = await controller.remove(mockReq, 'dash-1');
    expect(result).toEqual(archived);
  });
});
