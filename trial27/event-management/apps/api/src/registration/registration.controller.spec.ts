import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';

describe('RegistrationController', () => {
  let controller: RegistrationController;
  let service: { create: jest.Mock; findByEvent: jest.Mock };

  const mockReq = { user: { userId: 'u1', email: 'test@test.com', tenantId: 'tenant-1', role: 'ADMIN' } } as unknown as Request;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findByEvent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationController],
      providers: [{ provide: RegistrationService, useValue: service }],
    }).compile();

    controller = module.get<RegistrationController>(RegistrationController);
  });

  it('should call create with tenantId, eventId, and dto', async () => {
    const dto = { ticketTypeId: 'tt1', attendeeName: 'John', attendeeEmail: 'john@test.com' };
    service.create.mockResolvedValue({ id: 'reg1' });

    await controller.create(mockReq, 'event-1', dto as unknown as CreateRegistrationDto);

    expect(service.create).toHaveBeenCalledWith('tenant-1', 'event-1', dto);
  });

  it('should call findByEvent with tenantId, eventId, and pagination', async () => {
    service.findByEvent.mockResolvedValue({ data: [], meta: { total: 0 } });

    await controller.findByEvent(mockReq, 'event-1', '1', '10');

    expect(service.findByEvent).toHaveBeenCalledWith('tenant-1', 'event-1', '1', '10');
  });
});
