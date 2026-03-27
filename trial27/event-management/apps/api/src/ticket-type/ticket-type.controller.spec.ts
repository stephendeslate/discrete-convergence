import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { TicketTypeController } from './ticket-type.controller';
import { TicketTypeService } from './ticket-type.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';

describe('TicketTypeController', () => {
  let controller: TicketTypeController;
  let service: { create: jest.Mock; findByEvent: jest.Mock };

  const mockReq = { user: { userId: 'u1', email: 'test@test.com', tenantId: 'tenant-1', role: 'ADMIN' } } as unknown as Request;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findByEvent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketTypeController],
      providers: [{ provide: TicketTypeService, useValue: service }],
    }).compile();

    controller = module.get<TicketTypeController>(TicketTypeController);
  });

  it('should call create with tenantId, eventId, and dto', async () => {
    const dto = { name: 'VIP', price: 100, quantity: 50 };
    service.create.mockResolvedValue({ id: 'tt1', ...dto });

    await controller.create(mockReq, 'event-1', dto as unknown as CreateTicketTypeDto);

    expect(service.create).toHaveBeenCalledWith('tenant-1', 'event-1', dto);
  });

  it('should call findByEvent with tenantId and eventId', async () => {
    service.findByEvent.mockResolvedValue([]);

    await controller.findByEvent(mockReq, 'event-1');

    expect(service.findByEvent).toHaveBeenCalledWith('tenant-1', 'event-1');
  });
});
