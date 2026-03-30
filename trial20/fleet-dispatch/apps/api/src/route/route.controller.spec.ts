import { Test } from '@nestjs/testing';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('RouteController', () => {
  let controller: RouteController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [RouteController],
      providers: [{ provide: RouteService, useValue: mockService }],
    }).compile();
    controller = module.get(RouteController);
    jest.clearAllMocks();
  });

  it('should call findAll with tenant id', async () => {
    const req = { user: { tenantId: 't1' } } as never;
    const res = { setHeader: jest.fn() } as never;
    mockService.findAll.mockResolvedValue({ data: [], total: 0 });
    const result = await controller.findAll(req, {}, res);
    expect(mockService.findAll).toHaveBeenCalledWith('t1', undefined, undefined);
    expect(result.total).toBe(0);
  });

  it('should call findOne with tenant id', async () => {
    const req = { user: { tenantId: 't1' } } as never;
    mockService.findOne.mockResolvedValue({ id: '1' });
    const result = await controller.findOne('1', req);
    expect(mockService.findOne).toHaveBeenCalledWith('1', 't1');
    expect(result.id).toBe('1');
  });
});
