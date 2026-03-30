import { ForbiddenException } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('TicketController', () => {
  const controller = new TicketController(mockService as unknown as TicketService);
  const adminReq = { user: { sub: 'u1', email: 'a@b.com', role: 'ADMIN', organizationId: 'o1' } };
  const viewerReq = { user: { sub: 'u2', email: 'v@b.com', role: 'VIEWER', organizationId: 'o1' } };

  beforeEach(() => jest.clearAllMocks());

  it('create delegates to service', async () => {
    const dto = { type: 'VIP', price: 100, quantity: 50, eventId: 'e1' };
    mockService.create.mockResolvedValue({ id: 't1', ...dto });
    await controller.create(dto as never, adminReq as never);
    expect(mockService.create).toHaveBeenCalledWith(dto, 'o1');
  });

  it('create throws ForbiddenException for VIEWER', async () => {
    await expect(controller.create({} as never, viewerReq as never)).rejects.toThrow(ForbiddenException);
  });

  it('findAll delegates to service', async () => {
    mockService.findAll.mockResolvedValue({ data: [], meta: {} });
    await controller.findAll({ page: 1, pageSize: 20 } as never, adminReq as never);
    expect(mockService.findAll).toHaveBeenCalledWith('o1', 1, 20);
  });

  it('findOne delegates to service', async () => {
    mockService.findOne.mockResolvedValue({ id: 't1' });
    const result = await controller.findOne('t1', adminReq as never);
    expect(result.id).toBe('t1');
  });

  it('update delegates to service', async () => {
    mockService.update.mockResolvedValue({ id: 't1' });
    await controller.update('t1', { price: 200 } as never, adminReq as never);
    expect(mockService.update).toHaveBeenCalledWith('t1', { price: 200 }, 'o1');
  });

  it('remove delegates to service', async () => {
    mockService.remove.mockResolvedValue({ deleted: true });
    await controller.remove('t1', adminReq as never);
    expect(mockService.remove).toHaveBeenCalledWith('t1', 'o1');
  });
});
