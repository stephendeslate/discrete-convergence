import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
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

describe('VehicleController', () => {
  let controller: VehicleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [{ provide: VehicleService, useValue: mockService }],
    }).compile();
    controller = module.get<VehicleController>(VehicleController);
    jest.clearAllMocks();
  });

  it('should create vehicle with tenantId from user', () => {
    const dto = { name: 'Truck A', licensePlate: 'ABC-123' };
    mockService.create.mockResolvedValue({ id: 'v-1' });
    controller.create(mockReq, dto as CreateVehicleDto);
    expect(mockService.create).toHaveBeenCalledWith('t-1', dto);
  });

  it('should findAll with pagination', () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0 });
    controller.findAll(mockReq, { page: 1, pageSize: 10 } as PaginatedQueryDto);
    expect(mockService.findAll).toHaveBeenCalledWith('t-1', 1, 10);
  });

  it('should findOne by id', () => {
    mockService.findOne.mockResolvedValue({ id: 'v-1' });
    controller.findOne(mockReq, 'v-1');
    expect(mockService.findOne).toHaveBeenCalledWith('t-1', 'v-1');
  });

  it('should update vehicle', () => {
    const dto = { name: 'Updated' };
    mockService.update.mockResolvedValue({ id: 'v-1' });
    controller.update(mockReq, 'v-1', dto as UpdateVehicleDto);
    expect(mockService.update).toHaveBeenCalledWith('t-1', 'v-1', dto);
  });

  it('should remove vehicle', () => {
    mockService.remove.mockResolvedValue({ id: 'v-1' });
    controller.remove(mockReq, 'v-1');
    expect(mockService.remove).toHaveBeenCalledWith('t-1', 'v-1');
  });
});
