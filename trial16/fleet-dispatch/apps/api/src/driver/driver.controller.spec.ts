import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
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
};

const mockReq = { user: { sub: 'u-1', email: 'a@b.com', role: 'admin', tenantId: 't-1' } } as unknown as Request;

describe('DriverController', () => {
  let controller: DriverController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriverController],
      providers: [{ provide: DriverService, useValue: mockService }],
    }).compile();
    controller = module.get<DriverController>(DriverController);
    jest.clearAllMocks();
  });

  it('should create driver with tenantId from user', () => {
    const dto = { firstName: 'John', lastName: 'Doe' };
    mockService.create.mockResolvedValue({ id: 'drv-1' });
    controller.create(mockReq, dto as CreateDriverDto);
    expect(mockService.create).toHaveBeenCalledWith('t-1', dto);
  });

  it('should findAll with pagination', () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0 });
    controller.findAll(mockReq, { page: 2, pageSize: 5 } as PaginatedQueryDto);
    expect(mockService.findAll).toHaveBeenCalledWith('t-1', 2, 5);
  });

  it('should findOne by id', () => {
    mockService.findOne.mockResolvedValue({ id: 'drv-1' });
    controller.findOne(mockReq, 'drv-1');
    expect(mockService.findOne).toHaveBeenCalledWith('t-1', 'drv-1');
  });

  it('should update driver', () => {
    const dto = { firstName: 'Jane' };
    mockService.update.mockResolvedValue({ id: 'drv-1' });
    controller.update(mockReq, 'drv-1', dto as UpdateDriverDto);
    expect(mockService.update).toHaveBeenCalledWith('t-1', 'drv-1', dto);
  });

  it('should remove driver', () => {
    mockService.remove.mockResolvedValue({ id: 'drv-1' });
    controller.remove(mockReq, 'drv-1');
    expect(mockService.remove).toHaveBeenCalledWith('t-1', 'drv-1');
  });
});
