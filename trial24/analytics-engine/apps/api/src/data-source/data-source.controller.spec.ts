// TRACED:DATASOURCE-CONTROLLER-SPEC
import { DataSourceController } from './data-source.controller';
import { DataSourceService } from './data-source.service';
import { Request } from 'express';
import { CreateDataSourceDto, UpdateDataSourceDto } from './data-source.dto';
import { PaginatedQuery } from '../common/paginated-query';
import { AuthenticatedUser } from '../common/auth-utils';

describe('DataSourceController', () => {
  let controller: DataSourceController;
  let service: jest.Mocked<DataSourceService>;
  const user: AuthenticatedUser = { sub: 'u-1', email: 'a@b.com', role: 'VIEWER', tenantId: 't-1' };
  const req = { user } as unknown as Request;

  beforeEach(() => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 'ds-1', name: 'PG' }),
      findAll: jest.fn().mockResolvedValue({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }),
      findOne: jest.fn().mockResolvedValue({ id: 'ds-1', name: 'PG' }),
      update: jest.fn().mockResolvedValue({ id: 'ds-1', name: 'Updated' }),
      remove: jest.fn().mockResolvedValue({ id: 'ds-1' }),
    } as unknown as jest.Mocked<DataSourceService>;
    controller = new DataSourceController(service);
  });

  it('should create a data source', async () => {
    const dto: CreateDataSourceDto = { name: 'PG', type: 'postgres', connectionString: 'pg://localhost' };
    const result = await controller.create(dto, req);
    expect(service.create).toHaveBeenCalledWith(dto, 't-1');
    expect(result).toHaveProperty('id');
  });

  it('should find all data sources', async () => {
    const query: PaginatedQuery = { page: 1, limit: 20 };
    const result = await controller.findAll(query, req);
    expect(service.findAll).toHaveBeenCalledWith('t-1', 1, 20);
    expect(result).toHaveProperty('data');
  });

  it('should find one data source', async () => {
    const result = await controller.findOne('ds-1', req);
    expect(service.findOne).toHaveBeenCalledWith('ds-1', 't-1');
    expect(result).toHaveProperty('id');
  });

  it('should update a data source', async () => {
    const dto: UpdateDataSourceDto = { name: 'Updated' };
    const result = await controller.update('ds-1', dto, req);
    expect(service.update).toHaveBeenCalledWith('ds-1', dto, 't-1');
    expect(result.name).toBe('Updated');
  });

  it('should remove a data source', async () => {
    const result = await controller.remove('ds-1', req);
    expect(service.remove).toHaveBeenCalledWith('ds-1', 't-1');
    expect(result).toHaveProperty('id');
  });
});
