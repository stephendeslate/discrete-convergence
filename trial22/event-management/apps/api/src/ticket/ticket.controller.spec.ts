import { Test, TestingModule } from '@nestjs/testing';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';

const mockService = { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() };
const mockReq = { user: { userId: 'u1', email: 'a@b.com', tenantId: 't1', role: 'USER' } };

describe('TicketController', () => {
  let controller: TicketController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [{ provide: TicketService, useValue: mockService }],
    }).compile();
    controller = module.get<TicketController>(TicketController);
    jest.clearAllMocks();
  });

  it('should call findAll', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0 });
    const result = await controller.findAll(mockReq as never, { page: 1, limit: 20 });
    expect(mockService.findAll).toHaveBeenCalledWith('t1', { page: 1, limit: 20 });
    expect(result.data).toEqual([]);
  });

  it('should call create', async () => {
    const dto = { price: 10, eventId: 'e1', ticketTypeId: 'tt1' };
    mockService.create.mockResolvedValue({ id: '1' });
    const result = await controller.create(mockReq as never, dto);
    expect(mockService.create).toHaveBeenCalledWith('t1', dto);
    expect(result.id).toBe('1');
  });
});
