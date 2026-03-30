import { ForbiddenException } from '@nestjs/common';
import { AttendeeController } from './attendee.controller';
import { AttendeeService } from './attendee.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

describe('AttendeeController', () => {
  const controller = new AttendeeController(mockService as unknown as AttendeeService);
  const adminReq = { user: { sub: 'u1', email: 'a@b.com', role: 'ADMIN', organizationId: 'o1' } };
  const viewerReq = { user: { sub: 'u2', email: 'v@b.com', role: 'VIEWER', organizationId: 'o1' } };

  beforeEach(() => jest.clearAllMocks());

  it('create delegates to service', async () => {
    const dto = { name: 'John', email: 'john@test.com', ticketId: 't1', eventId: 'e1' };
    mockService.create.mockResolvedValue({ id: 'a1', ...dto });
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
    mockService.findOne.mockResolvedValue({ id: 'a1' });
    const result = await controller.findOne('a1', adminReq as never);
    expect(result.id).toBe('a1');
  });

  it('remove delegates to service', async () => {
    mockService.remove.mockResolvedValue({ deleted: true });
    await controller.remove('a1', adminReq as never);
    expect(mockService.remove).toHaveBeenCalledWith('a1', 'o1');
  });

  it('remove throws ForbiddenException for non-ADMIN', async () => {
    const editorReq = { user: { sub: 'u3', email: 'e@b.com', role: 'EDITOR', organizationId: 'o1' } };
    await expect(controller.remove('a1', editorReq as never)).rejects.toThrow(ForbiddenException);
  });
});
