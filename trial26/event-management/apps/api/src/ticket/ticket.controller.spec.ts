// Unit tests
import { Test } from '@nestjs/testing';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';

describe('TicketController', () => {
  let controller: TicketController;
  let ticketService: Record<string, jest.Mock>;

  beforeEach(async () => {
    ticketService = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }),
      findOne: jest.fn().mockResolvedValue({ id: '1' }),
      create: jest.fn().mockResolvedValue({ id: '1' }),
      cancel: jest.fn().mockResolvedValue({ id: '1', status: 'CANCELLED' }),
      refund: jest.fn().mockResolvedValue({ id: '1', status: 'REFUNDED' }),
    };

    const module = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [{ provide: TicketService, useValue: ticketService }],
    }).compile();

    controller = module.get<TicketController>(TicketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAll', async () => {
    const req = { user: { userId: 'u1', tenantId: 't1', role: 'ADMIN', email: 'a@a.com' } } as never;
    await controller.findAll(req, {});
    expect(ticketService['findAll']).toHaveBeenCalledWith('t1', {});
  });
});
