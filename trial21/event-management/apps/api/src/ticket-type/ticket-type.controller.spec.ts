import { Test } from '@nestjs/testing';
import { TicketTypeController } from './ticket-type.controller';
import { TicketTypeService } from './ticket-type.service';

const mockTicketTypeService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('TicketTypeController', () => {
  let controller: TicketTypeController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [TicketTypeController],
      providers: [{ provide: TicketTypeService, useValue: mockTicketTypeService }],
    }).compile();
    controller = module.get(TicketTypeController);
  });

  it('should create a ticket type with price in cents', async () => {
    const ticketType = { id: 'tt1', name: 'VIP', price: 5000, quota: 100 };
    mockTicketTypeService.create.mockResolvedValue(ticketType);
    const req = { user: { organizationId: 'org1' } };

    const result = await controller.create('e1', { name: 'VIP', price: 5000, quota: 100 }, req);
    expect(result.price).toBe(5000);
    expect(mockTicketTypeService.create).toHaveBeenCalledWith('e1', { name: 'VIP', price: 5000, quota: 100 }, 'org1');
  });

  it('should list ticket types for an event', async () => {
    const types = [{ id: 'tt1', name: 'General' }, { id: 'tt2', name: 'VIP' }];
    mockTicketTypeService.findAll.mockResolvedValue(types);
    const req = { user: { organizationId: 'org1' } };

    const result = await controller.findAll('e1', req);
    expect(result).toHaveLength(2);
    expect(mockTicketTypeService.findAll).toHaveBeenCalledWith('e1', 'org1');
  });

  it('should find a single ticket type', async () => {
    const ticketType = { id: 'tt1', name: 'VIP' };
    mockTicketTypeService.findOne.mockResolvedValue(ticketType);
    const req = { user: { organizationId: 'org1' } };

    const result = await controller.findOne('e1', 'tt1', req);
    expect(result.name).toBe('VIP');
    expect(mockTicketTypeService.findOne).toHaveBeenCalledWith('e1', 'tt1', 'org1');
  });

  it('should update a ticket type', async () => {
    const updated = { id: 'tt1', name: 'Premium', price: 7500 };
    mockTicketTypeService.update.mockResolvedValue(updated);
    const req = { user: { organizationId: 'org1' } };

    const result = await controller.update('e1', 'tt1', { name: 'Premium', price: 7500 }, req);
    expect(result.name).toBe('Premium');
    expect(result.price).toBe(7500);
  });

  it('should delete a ticket type', async () => {
    mockTicketTypeService.remove.mockResolvedValue({ id: 'tt1' });
    const req = { user: { organizationId: 'org1' } };

    await controller.remove('e1', 'tt1', req);
    expect(mockTicketTypeService.remove).toHaveBeenCalledWith('e1', 'tt1', 'org1');
  });
});
