import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

jest.mock('@fleet-dispatch/shared', () => ({
  parsePagination: jest.fn().mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
  JwtPayload: {},
}));

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getDispatchStats: jest.fn(),
};

const mockReq = { user: { sub: 'u-1', email: 'a@b.com', role: 'admin', tenantId: 't-1' } } as unknown as Request;

describe('DispatchController', () => {
  let controller: DispatchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DispatchController],
      providers: [{ provide: DispatchService, useValue: mockService }],
    }).compile();
    controller = module.get<DispatchController>(DispatchController);
    jest.clearAllMocks();
  });

  it('should create dispatch with tenantId from user', () => {
    const dto = { title: 'Test' };
    mockService.create.mockResolvedValue({ id: 'd-1' });
    controller.create(mockReq, dto as CreateDispatchDto);
    expect(mockService.create).toHaveBeenCalledWith('t-1', dto);
  });

  it('should findAll with pagination from query', () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0 });
    controller.findAll(mockReq, { page: 1, pageSize: 10 } as PaginatedQueryDto);
    expect(mockService.findAll).toHaveBeenCalledWith('t-1', 1, 10);
  });

  it('should findOne by id with tenantId', () => {
    mockService.findOne.mockResolvedValue({ id: 'd-1' });
    controller.findOne(mockReq, 'd-1');
    expect(mockService.findOne).toHaveBeenCalledWith('t-1', 'd-1');
  });

  it('should update dispatch', () => {
    const dto = { title: 'Updated' };
    mockService.update.mockResolvedValue({ id: 'd-1', title: 'Updated' });
    controller.update(mockReq, 'd-1', dto as UpdateDispatchDto);
    expect(mockService.update).toHaveBeenCalledWith('t-1', 'd-1', dto);
  });

  it('should remove dispatch', () => {
    mockService.remove.mockResolvedValue({ id: 'd-1' });
    controller.remove(mockReq, 'd-1');
    expect(mockService.remove).toHaveBeenCalledWith('t-1', 'd-1');
  });

  it('should get dispatch stats', () => {
    mockService.getDispatchStats.mockResolvedValue({ count: 5 });
    controller.getStats(mockReq);
    expect(mockService.getDispatchStats).toHaveBeenCalledWith('t-1');
  });
});
