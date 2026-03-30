import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';

describe('RegistrationController', () => {
  let controller: RegistrationController;
  let service: {
    register: jest.Mock;
    findAllByEvent: jest.Mock;
    cancel: jest.Mock;
  };

  const mockReq = {
    user: { sub: 'user-1', email: 'u@test.com', role: 'ADMIN', organizationId: 'org-1' },
  } as never;

  const mockRes = {
    setHeader: jest.fn(),
  } as never;

  beforeEach(async () => {
    service = {
      register: jest.fn(),
      findAllByEvent: jest.fn(),
      cancel: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationController],
      providers: [{ provide: RegistrationService, useValue: service }],
    }).compile();

    controller = module.get<RegistrationController>(RegistrationController);
  });

  it('should register for an event', async () => {
    const dto = { ticketTypeId: 'tt-1', attendeeName: 'Alice', attendeeEmail: 'alice@test.com' };
    const expected = { id: 'reg-1', ...dto };
    service.register.mockResolvedValue(expected);

    const result = await controller.register(mockReq, 'evt-1', dto);
    expect(result).toEqual(expected);
    expect(service.register).toHaveBeenCalledWith('org-1', 'evt-1', dto);
  });

  it('should list registrations for an event', async () => {
    const paginated = { data: [], total: 0, page: 1, limit: 20 };
    service.findAllByEvent.mockResolvedValue(paginated);

    const result = await controller.findAllByEvent(mockReq, mockRes, 'evt-1', {});
    expect(result).toEqual(paginated);
  });

  it('should cancel a registration', async () => {
    const cancelled = { id: 'reg-1', status: 'CANCELLED' };
    service.cancel.mockResolvedValue(cancelled);

    const result = await controller.cancel(mockReq, 'reg-1');
    expect(result).toEqual(cancelled);
    expect(service.cancel).toHaveBeenCalledWith('org-1', 'reg-1');
  });
});
