import { ForbiddenException } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('SessionController', () => {
  const controller = new SessionController(mockService as unknown as SessionService);
  const adminReq = { user: { sub: 'u1', email: 'a@b.com', role: 'ADMIN', organizationId: 'o1' } };
  const viewerReq = { user: { sub: 'u2', email: 'v@b.com', role: 'VIEWER', organizationId: 'o1' } };

  beforeEach(() => jest.clearAllMocks());

  it('create delegates to service with organizationId', async () => {
    const dto = { title: 'Keynote', startTime: '2024-06-15T09:00:00Z', endTime: '2024-06-15T10:00:00Z', eventId: 'e1' };
    mockService.create.mockResolvedValue({ id: 's1', ...dto });
    await controller.create(dto as never, adminReq as never);
    expect(mockService.create).toHaveBeenCalledWith(dto, 'o1');
  });

  it('create throws ForbiddenException for VIEWER', async () => {
    const dto = { title: 'Keynote', startTime: '2024-06-15T09:00:00Z', endTime: '2024-06-15T10:00:00Z', eventId: 'e1' };
    await expect(controller.create(dto as never, viewerReq as never)).rejects.toThrow(ForbiddenException);
  });

  it('findAll delegates to service', async () => {
    mockService.findAll.mockResolvedValue({ data: [], meta: {} });
    await controller.findAll({ page: 1, pageSize: 20 } as never, adminReq as never);
    expect(mockService.findAll).toHaveBeenCalledWith('o1', 1, 20);
  });

  it('findOne delegates to service', async () => {
    mockService.findOne.mockResolvedValue({ id: 's1' });
    const result = await controller.findOne('s1', adminReq as never);
    expect(result.id).toBe('s1');
  });

  it('update delegates to service', async () => {
    mockService.update.mockResolvedValue({ id: 's1' });
    await controller.update('s1', { title: 'Updated' } as never, adminReq as never);
    expect(mockService.update).toHaveBeenCalledWith('s1', { title: 'Updated' }, 'o1');
  });

  it('update throws ForbiddenException for VIEWER', async () => {
    await expect(controller.update('s1', {} as never, viewerReq as never)).rejects.toThrow(ForbiddenException);
  });

  it('remove delegates to service', async () => {
    mockService.remove.mockResolvedValue({ deleted: true });
    await controller.remove('s1', adminReq as never);
    expect(mockService.remove).toHaveBeenCalledWith('s1', 'o1');
  });

  it('remove throws ForbiddenException for non-ADMIN', async () => {
    const editorReq = { user: { sub: 'u3', email: 'e@b.com', role: 'EDITOR', organizationId: 'o1' } };
    await expect(controller.remove('s1', editorReq as never)).rejects.toThrow(ForbiddenException);
  });
});
