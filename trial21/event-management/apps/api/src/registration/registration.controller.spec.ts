import { Test } from '@nestjs/testing';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';

const mockRegistrationService = {
  register: jest.fn(),
  findAll: jest.fn(),
  findUserRegistrations: jest.fn(),
  cancel: jest.fn(),
};

describe('RegistrationController', () => {
  let controller: RegistrationController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [RegistrationController],
      providers: [{ provide: RegistrationService, useValue: mockRegistrationService }],
    }).compile();
    controller = module.get(RegistrationController);
  });

  it('should register a user for an event', async () => {
    const registration = { id: 'r1', status: 'CONFIRMED' };
    mockRegistrationService.register.mockResolvedValue(registration);
    const req = { user: { id: 'u1' } };

    const result = await controller.register('e1', { ticketTypeId: 'tt1' }, req);
    expect(result.status).toBe('CONFIRMED');
    expect(mockRegistrationService.register).toHaveBeenCalledWith('e1', 'u1', { ticketTypeId: 'tt1' });
  });

  it('should list registrations for an event', async () => {
    const paginated = { data: [{ id: 'r1' }], total: 1 };
    mockRegistrationService.findAll.mockResolvedValue(paginated);

    const result = await controller.findAll('e1', { page: 1, limit: 20 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should return current user registrations', async () => {
    const paginated = { data: [{ id: 'r1' }, { id: 'r2' }], total: 2 };
    mockRegistrationService.findUserRegistrations.mockResolvedValue(paginated);
    const req = { user: { id: 'u1' } };

    const result = await controller.myRegistrations({ page: 1, limit: 20 }, req);
    expect(result.data).toHaveLength(2);
    expect(mockRegistrationService.findUserRegistrations).toHaveBeenCalledWith('u1', 1, 20);
  });

  it('should cancel a registration', async () => {
    const cancelled = { id: 'r1', status: 'CANCELLED' };
    mockRegistrationService.cancel.mockResolvedValue(cancelled);
    const req = { user: { id: 'u1' } };

    const result = await controller.cancel('r1', req);
    expect(result.status).toBe('CANCELLED');
    expect(mockRegistrationService.cancel).toHaveBeenCalledWith('r1', 'u1');
  });
});
