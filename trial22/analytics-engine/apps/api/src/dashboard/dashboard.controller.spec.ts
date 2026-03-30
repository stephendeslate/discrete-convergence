import { Test } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { RequestWithUser } from '../common/request-with-user';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockReq = { user: { userId: 'u1', email: 'a@b.com', tenantId: 't1', role: 'USER' } } as RequestWithUser;

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: mockService }],
    }).compile();
    controller = module.get(DashboardController);
    jest.clearAllMocks();
  });

  it('should call findAll with tenant id', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0 });
    const result = await controller.findAll(mockReq, {});
    expect(mockService.findAll).toHaveBeenCalledWith('t1', undefined, undefined);
    expect(result).toHaveProperty('data');
  });

  it('should call findOne with id and tenant', async () => {
    mockService.findOne.mockResolvedValue({ id: '1' });
    const result = await controller.findOne('1', mockReq);
    expect(mockService.findOne).toHaveBeenCalledWith('1', 't1');
    expect(result.id).toBe('1');
  });

  it('should call create with dto and tenant', async () => {
    const dto = { title: 'Test' };
    mockService.create.mockResolvedValue({ id: '1', title: 'Test' });
    const result = await controller.create(dto, mockReq);
    expect(mockService.create).toHaveBeenCalledWith(dto, 't1', 'u1');
    expect(result.title).toBe('Test');
  });

  it('should call remove with id and tenant', async () => {
    mockService.remove.mockResolvedValue({ id: '1' });
    const result = await controller.remove('1', mockReq);
    expect(mockService.remove).toHaveBeenCalledWith('1', 't1');
    expect(result.id).toBe('1');
  });
});
