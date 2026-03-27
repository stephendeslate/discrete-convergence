import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { VenueController } from './venue.controller';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

describe('VenueController', () => {
  let controller: VenueController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  const mockReq = { user: { userId: 'u1', email: 'test@test.com', tenantId: 'tenant-1', role: 'ADMIN' } } as unknown as Request;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VenueController],
      providers: [{ provide: VenueService, useValue: service }],
    }).compile();

    controller = module.get<VenueController>(VenueController);
  });

  it('should call create with tenantId and dto', async () => {
    const dto = { name: 'Hall', address: '123 St', capacity: 100 };
    service.create.mockResolvedValue({ id: 'v1', ...dto });

    await controller.create(mockReq, dto as unknown as CreateVenueDto);

    expect(service.create).toHaveBeenCalledWith('tenant-1', dto);
  });

  it('should call findAll with tenantId and pagination', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: { total: 0 } });

    await controller.findAll(mockReq, '1', '10');

    expect(service.findAll).toHaveBeenCalledWith('tenant-1', '1', '10');
  });

  it('should call findOne with tenantId and id', async () => {
    service.findOne.mockResolvedValue({ id: 'v1' });

    await controller.findOne(mockReq, 'v1');

    expect(service.findOne).toHaveBeenCalledWith('tenant-1', 'v1');
  });

  it('should call update with tenantId, id, and dto', async () => {
    const dto = { name: 'Updated Hall' };
    service.update.mockResolvedValue({ id: 'v1', name: 'Updated Hall' });

    await controller.update(mockReq, 'v1', dto as unknown as UpdateVenueDto);

    expect(service.update).toHaveBeenCalledWith('tenant-1', 'v1', dto);
  });

  it('should call remove with tenantId and id', async () => {
    service.remove.mockResolvedValue({ id: 'v1' });

    await controller.remove(mockReq, 'v1');

    expect(service.remove).toHaveBeenCalledWith('tenant-1', 'v1');
  });
});
