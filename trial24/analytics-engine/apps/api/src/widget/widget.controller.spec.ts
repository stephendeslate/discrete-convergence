// TRACED:WIDGET-CONTROLLER-SPEC
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';
import { Request } from 'express';
import { CreateWidgetDto, UpdateWidgetDto } from './widget.dto';
import { PaginatedQuery } from '../common/paginated-query';
import { AuthenticatedUser } from '../common/auth-utils';

describe('WidgetController', () => {
  let controller: WidgetController;
  let service: jest.Mocked<WidgetService>;
  const user: AuthenticatedUser = { sub: 'u-1', email: 'a@b.com', role: 'VIEWER', tenantId: 't-1' };
  const req = { user } as unknown as Request;

  beforeEach(() => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 'w-1', title: 'Chart' }),
      findByDashboard: jest.fn().mockResolvedValue({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }),
      findOne: jest.fn().mockResolvedValue({ id: 'w-1', title: 'Chart' }),
      update: jest.fn().mockResolvedValue({ id: 'w-1', title: 'Updated' }),
      remove: jest.fn().mockResolvedValue({ id: 'w-1' }),
    } as unknown as jest.Mocked<WidgetService>;
    controller = new WidgetController(service);
  });

  it('should create a widget', async () => {
    const dto: CreateWidgetDto = { title: 'Chart', type: 'bar', dashboardId: 'd-1' };
    const result = await controller.create(dto, req);
    expect(service.create).toHaveBeenCalledWith(dto, 't-1');
    expect(result).toHaveProperty('id');
  });

  it('should find widgets by dashboard', async () => {
    const query: PaginatedQuery = { page: 1, limit: 20 };
    const result = await controller.findByDashboard('d-1', query, req);
    expect(service.findByDashboard).toHaveBeenCalledWith('d-1', 't-1', 1, 20);
    expect(result).toHaveProperty('data');
  });

  it('should find one widget', async () => {
    const result = await controller.findOne('w-1', req);
    expect(service.findOne).toHaveBeenCalledWith('w-1', 't-1');
    expect(result).toHaveProperty('id');
  });

  it('should update a widget', async () => {
    const dto: UpdateWidgetDto = { title: 'Updated' };
    const result = await controller.update('w-1', dto, req);
    expect(service.update).toHaveBeenCalledWith('w-1', dto, 't-1');
    expect(result.title).toBe('Updated');
  });

  it('should remove a widget', async () => {
    const result = await controller.remove('w-1', req);
    expect(service.remove).toHaveBeenCalledWith('w-1', 't-1');
    expect(result).toHaveProperty('id');
  });
});
