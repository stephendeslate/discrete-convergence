import { Test } from '@nestjs/testing';
import { AttendeeController } from './attendee.controller';
import { AttendeeService } from './attendee.service';

const mockAttendeeService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('AttendeeController', () => {
  let controller: AttendeeController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AttendeeController],
      providers: [{ provide: AttendeeService, useValue: mockAttendeeService }],
    }).compile();
    controller = module.get(AttendeeController);
    jest.clearAllMocks();
  });

  it('should call create with tenant scoping', async () => {
    mockAttendeeService.create.mockResolvedValue({ id: 'a-1' });
    const req = { user: { tenantId: 'tenant-1', sub: 'user-1', email: 'a@b.com', role: 'VIEWER' } };

    await controller.create({ firstName: 'John', lastName: 'Doe', email: 'john@test.com' }, req as never);

    expect(mockAttendeeService.create).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'John' }),
      'tenant-1',
    );
  });

  it('should call findAll with pagination', async () => {
    mockAttendeeService.findAll.mockResolvedValue({ data: [], total: 0 });
    const req = { user: { tenantId: 'tenant-1', sub: 'user-1', email: 'a@b.com', role: 'VIEWER' } };

    await controller.findAll({ page: 1, limit: 10 }, req as never);

    expect(mockAttendeeService.findAll).toHaveBeenCalledWith('tenant-1', 1, 10);
  });
});
