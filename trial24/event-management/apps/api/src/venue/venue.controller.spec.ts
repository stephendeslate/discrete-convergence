import { ForbiddenException } from '@nestjs/common';
import { VenueController } from './venue.controller';
import { VenueService } from './venue.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('VenueController', () => {
  const controller = new VenueController(mockService as unknown as VenueService);
  const adminReq = { user: { sub: 'u1', email: 'a@b.com', role: 'ADMIN', organizationId: 'o1' } };
  const viewerReq = { user: { sub: 'u2', email: 'v@b.com', role: 'VIEWER', organizationId: 'o1' } };

  beforeEach(() => jest.clearAllMocks());

  it('create delegates to service', async () => {
    const dto = { name: 'Hall A', address: '123 St', capacity: 500 };
    mockService.create.mockResolvedValue({ id: 'v1', ...dto });
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
    mockService.findOne.mockResolvedValue({ id: 'v1' });
    const result = await controller.findOne('v1', adminReq as never);
    expect(result.id).toBe('v1');
  });

  it('update delegates to service', async () => {
    mockService.update.mockResolvedValue({ id: 'v1' });
    await controller.update('v1', { name: 'Hall B' } as never, adminReq as never);
    expect(mockService.update).toHaveBeenCalledWith('v1', { name: 'Hall B' }, 'o1');
  });

  it('remove delegates to service', async () => {
    mockService.remove.mockResolvedValue({ deleted: true });
    await controller.remove('v1', adminReq as never);
    expect(mockService.remove).toHaveBeenCalledWith('v1', 'o1');
  });
});
