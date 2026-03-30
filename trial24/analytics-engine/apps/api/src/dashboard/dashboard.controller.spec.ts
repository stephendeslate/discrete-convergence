// TRACED:DASHBOARD-CONTROLLER-SPEC
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Request } from 'express';
import { CreateDashboardDto, UpdateDashboardDto } from './dashboard.dto';
import { PaginatedQuery } from '../common/paginated-query';
import { AuthenticatedUser } from '../common/auth-utils';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: jest.Mocked<DashboardService>;
  const user: AuthenticatedUser = { sub: 'u-1', email: 'a@b.com', role: 'ADMIN', tenantId: 't-1' };
  const req = { user } as unknown as Request;

  beforeEach(() => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 'd-1', name: 'Test' }),
      findAll: jest.fn().mockResolvedValue({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }),
      findOne: jest.fn().mockResolvedValue({ id: 'd-1', name: 'Test' }),
      update: jest.fn().mockResolvedValue({ id: 'd-1', name: 'Updated' }),
      remove: jest.fn().mockResolvedValue({ id: 'd-1' }),
    } as unknown as jest.Mocked<DashboardService>;
    controller = new DashboardController(service);
  });

  it('should create a dashboard', async () => {
    const dto: CreateDashboardDto = { name: 'Test' };
    const result = await controller.create(dto, req);
    expect(service.create).toHaveBeenCalledWith(dto, 'u-1', 't-1');
    expect(result).toHaveProperty('id');
  });

  it('should find all dashboards', async () => {
    const query: PaginatedQuery = { page: 1, limit: 20 };
    const result = await controller.findAll(query, req);
    expect(service.findAll).toHaveBeenCalledWith('t-1', 1, 20);
    expect(result).toHaveProperty('data');
  });

  it('should find one dashboard', async () => {
    const result = await controller.findOne('d-1', req);
    expect(service.findOne).toHaveBeenCalledWith('d-1', 't-1');
    expect(result).toHaveProperty('id');
  });

  it('should update a dashboard', async () => {
    const dto: UpdateDashboardDto = { name: 'Updated' };
    const result = await controller.update('d-1', dto, req);
    expect(service.update).toHaveBeenCalledWith('d-1', dto, 'u-1', 't-1');
    expect(result.name).toBe('Updated');
  });

  it('should remove a dashboard', async () => {
    const result = await controller.remove('d-1', req);
    expect(service.remove).toHaveBeenCalledWith('d-1', 'u-1', 't-1');
    expect(result).toHaveProperty('id');
  });
});
