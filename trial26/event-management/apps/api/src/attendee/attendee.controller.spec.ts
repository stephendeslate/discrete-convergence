// Unit tests
import { Test } from '@nestjs/testing';
import { AttendeeController } from './attendee.controller';
import { AttendeeService } from './attendee.service';

describe('AttendeeController', () => {
  let controller: AttendeeController;
  let attendeeService: Record<string, jest.Mock>;

  beforeEach(async () => {
    attendeeService = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }),
      findOne: jest.fn().mockResolvedValue({ id: '1' }),
      register: jest.fn().mockResolvedValue({ id: '1' }),
      checkIn: jest.fn().mockResolvedValue({ id: '1', checkedIn: true }),
    };

    const module = await Test.createTestingModule({
      controllers: [AttendeeController],
      providers: [{ provide: AttendeeService, useValue: attendeeService }],
    }).compile();

    controller = module.get<AttendeeController>(AttendeeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAll', async () => {
    const req = { user: { userId: 'u1', tenantId: 't1', role: 'ADMIN', email: 'a@a.com' } } as never;
    await controller.findAll(req, {});
    expect(attendeeService['findAll']).toHaveBeenCalledWith('t1', {});
  });
});
