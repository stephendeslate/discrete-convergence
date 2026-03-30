import { ForbiddenException } from '@nestjs/common';
import { SpeakerController } from './speaker.controller';
import { SpeakerService } from './speaker.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('SpeakerController', () => {
  const controller = new SpeakerController(mockService as unknown as SpeakerService);
  const adminReq = { user: { sub: 'u1', email: 'a@b.com', role: 'ADMIN', organizationId: 'o1' } };
  const viewerReq = { user: { sub: 'u2', email: 'v@b.com', role: 'VIEWER', organizationId: 'o1' } };

  beforeEach(() => jest.clearAllMocks());

  it('create delegates to service', async () => {
    const dto = { name: 'Jane Doe', email: 'jane@test.com', bio: 'Speaker bio' };
    mockService.create.mockResolvedValue({ id: 'sp1', ...dto });
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
    mockService.findOne.mockResolvedValue({ id: 'sp1' });
    const result = await controller.findOne('sp1', adminReq as never);
    expect(result.id).toBe('sp1');
  });

  it('update delegates to service', async () => {
    mockService.update.mockResolvedValue({ id: 'sp1' });
    await controller.update('sp1', { name: 'Updated' } as never, adminReq as never);
    expect(mockService.update).toHaveBeenCalledWith('sp1', { name: 'Updated' }, 'o1');
  });

  it('remove delegates to service', async () => {
    mockService.remove.mockResolvedValue({ deleted: true });
    await controller.remove('sp1', adminReq as never);
    expect(mockService.remove).toHaveBeenCalledWith('sp1', 'o1');
  });
});
