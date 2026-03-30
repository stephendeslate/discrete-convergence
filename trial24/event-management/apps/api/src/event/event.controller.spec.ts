import { ForbiddenException } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';


const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('EventController', () => {
  const controller = new EventController(mockService as unknown as EventService);
  const adminReq = { user: { sub: 'u1', email: 'a@b.com', role: 'ADMIN', organizationId: 'o1' } };
  const viewerReq = { user: { sub: 'u2', email: 'v@b.com', role: 'VIEWER', organizationId: 'o1' } };

  beforeEach(() => jest.clearAllMocks());

  it('create delegates to service with organizationId', async () => {
    const dto = { title: 'Test', startDate: '2024-06-15T09:00:00Z', endDate: '2024-06-17T17:00:00Z' };
    mockService.create.mockResolvedValue({ id: 'e1', ...dto });
    await controller.create(dto as never, adminReq as never);
    expect(mockService.create).toHaveBeenCalledWith(dto, 'o1');
  });

  it('create throws ForbiddenException for VIEWER role', async () => {
    const dto = { title: 'Test', startDate: '2024-06-15T09:00:00Z', endDate: '2024-06-17T17:00:00Z' };
    await expect(controller.create(dto as never, viewerReq as never)).rejects.toThrow(ForbiddenException);
  });

  it('findAll delegates to service', async () => {
    mockService.findAll.mockResolvedValue({ data: [], meta: {} });
    await controller.findAll({ page: 1, pageSize: 20 } as never, adminReq as never);
    expect(mockService.findAll).toHaveBeenCalledWith('o1', 1, 20);
  });

  it('findOne delegates to service', async () => {
    mockService.findOne.mockResolvedValue({ id: 'e1' });
    const result = await controller.findOne('e1', adminReq as never);
    expect(result.id).toBe('e1');
  });

  it('update delegates to service', async () => {
    mockService.update.mockResolvedValue({ id: 'e1' });
    await controller.update('e1', { title: 'Updated' } as never, adminReq as never);
    expect(mockService.update).toHaveBeenCalledWith('e1', { title: 'Updated' }, 'o1');
  });

  it('remove delegates to service', async () => {
    mockService.remove.mockResolvedValue({ deleted: true });
    await controller.remove('e1', adminReq as never);
    expect(mockService.remove).toHaveBeenCalledWith('e1', 'o1');
  });
});
