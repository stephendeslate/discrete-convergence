import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

describe('EventController', () => {
  let controller: EventController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    publish: jest.Mock;
    cancel: jest.Mock;
    remove: jest.Mock;
  };

  const mockReq = { user: { userId: 'u1', email: 'test@test.com', tenantId: 'tenant-1', role: 'ADMIN' } } as unknown as Request;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      publish: jest.fn(),
      cancel: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [{ provide: EventService, useValue: service }],
    }).compile();

    controller = module.get<EventController>(EventController);
  });

  it('should call create with tenantId and dto', async () => {
    const dto = { name: 'Event', startDate: '2025-06-01', endDate: '2025-06-02' };
    service.create.mockResolvedValue({ id: 'e1', ...dto });

    await controller.create(mockReq, dto as unknown as CreateEventDto);

    expect(service.create).toHaveBeenCalledWith('tenant-1', dto);
  });

  it('should call findAll with tenantId and pagination', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: { total: 0 } });

    await controller.findAll(mockReq, '1', '10');

    expect(service.findAll).toHaveBeenCalledWith('tenant-1', '1', '10');
  });

  it('should call findOne with tenantId and id', async () => {
    service.findOne.mockResolvedValue({ id: 'e1' });

    await controller.findOne(mockReq, 'e1');

    expect(service.findOne).toHaveBeenCalledWith('tenant-1', 'e1');
  });

  it('should call update with tenantId, id, and dto', async () => {
    const dto = { name: 'Updated' };
    service.update.mockResolvedValue({ id: 'e1', name: 'Updated' });

    await controller.update(mockReq, 'e1', dto as unknown as UpdateEventDto);

    expect(service.update).toHaveBeenCalledWith('tenant-1', 'e1', dto);
  });

  it('should call publish with tenantId and id', async () => {
    service.publish.mockResolvedValue({ id: 'e1', status: 'PUBLISHED' });

    await controller.publish(mockReq, 'e1');

    expect(service.publish).toHaveBeenCalledWith('tenant-1', 'e1');
  });

  it('should call cancel with tenantId and id', async () => {
    service.cancel.mockResolvedValue({ id: 'e1', status: 'CANCELLED' });

    await controller.cancel(mockReq, 'e1');

    expect(service.cancel).toHaveBeenCalledWith('tenant-1', 'e1');
  });

  it('should call remove with tenantId and id', async () => {
    service.remove.mockResolvedValue({ id: 'e1' });

    await controller.remove(mockReq, 'e1');

    expect(service.remove).toHaveBeenCalledWith('tenant-1', 'e1');
  });
});
