import { Test } from '@nestjs/testing';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';
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

describe('WidgetController', () => {
  let controller: WidgetController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [WidgetController],
      providers: [{ provide: WidgetService, useValue: mockService }],
    }).compile();

    controller = module.get(WidgetController);
    jest.clearAllMocks();
  });

  it('should call findAll with tenant from request', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0 });

    await controller.findAll(mockReq, {});

    expect(mockService.findAll).toHaveBeenCalledWith('tenant-1', undefined, undefined);
  });

  it('should call findOne with id and tenant', async () => {
    mockService.findOne.mockResolvedValue({ id: 'w1' });

    await controller.findOne('w1', mockReq);

    expect(mockService.findOne).toHaveBeenCalledWith('w1', 'tenant-1');
  });

  it('should call create with dto and tenant', async () => {
    mockService.create.mockResolvedValue({ id: 'w1' });

    await controller.create({ name: 'Chart', type: 'CHART', dashboardId: 'd1' }, mockReq);

    expect(mockService.create).toHaveBeenCalledWith(
      { name: 'Chart', type: 'CHART', dashboardId: 'd1' },
      'tenant-1',
    );
  });

  it('should call remove with id and tenant', async () => {
    mockService.remove.mockResolvedValue(undefined);

    await controller.remove('w1', mockReq);

    expect(mockService.remove).toHaveBeenCalledWith('w1', 'tenant-1');
  });
});
