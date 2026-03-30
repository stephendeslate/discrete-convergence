import { Test, TestingModule } from '@nestjs/testing';
import { TicketTypeController } from './ticket-type.controller';
import { TicketTypeService } from './ticket-type.service';

const mockService = { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() };
const mockReq = { user: { userId: 'u1', email: 'a@b.com', tenantId: 't1', role: 'USER' } };

describe('TicketTypeController', () => {
  let controller: TicketTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketTypeController],
      providers: [{ provide: TicketTypeService, useValue: mockService }],
    }).compile();
    controller = module.get<TicketTypeController>(TicketTypeController);
    jest.clearAllMocks();
  });

  it('should call findAll', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0 });
    const result = await controller.findAll(mockReq as never, { page: 1, limit: 20 });
    expect(mockService.findAll).toHaveBeenCalledWith('t1', { page: 1, limit: 20 });
    expect(result.total).toBe(0);
  });

  it('should call create', async () => {
    const dto = { name: 'VIP', price: 100, quantity: 50, eventId: 'e1' };
    mockService.create.mockResolvedValue({ id: '1' });
    const result = await controller.create(mockReq as never, dto);
    expect(mockService.create).toHaveBeenCalledWith('t1', dto);
    expect(result.id).toBe('1');
  });
});
