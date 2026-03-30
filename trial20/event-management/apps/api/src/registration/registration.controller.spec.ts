import { Test } from '@nestjs/testing';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';

const mockRegistrationService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('RegistrationController', () => {
  let controller: RegistrationController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [RegistrationController],
      providers: [{ provide: RegistrationService, useValue: mockRegistrationService }],
    }).compile();
    controller = module.get(RegistrationController);
    jest.clearAllMocks();
  });

  it('should call create with tenant scoping', async () => {
    mockRegistrationService.create.mockResolvedValue({ id: 'r-1' });
    const req = { user: { tenantId: 'tenant-1', sub: 'user-1', email: 'a@b.com', role: 'VIEWER' } };

    await controller.create({ eventId: 'e-1', attendeeId: 'a-1' }, req as never);

    expect(mockRegistrationService.create).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: 'e-1' }),
      'tenant-1',
    );
  });

  it('should call findAll with pagination', async () => {
    mockRegistrationService.findAll.mockResolvedValue({ data: [], total: 0 });
    const req = { user: { tenantId: 'tenant-1', sub: 'user-1', email: 'a@b.com', role: 'VIEWER' } };

    await controller.findAll({ page: 1, limit: 10 }, req as never);

    expect(mockRegistrationService.findAll).toHaveBeenCalledWith('tenant-1', 1, 10);
  });
});
