import { Test } from '@nestjs/testing';
import { DataSourceController } from './data-source.controller';

describe('DataSourceController', () => {
  let controller: DataSourceController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [DataSourceController],
    }).compile();
    controller = module.get(DataSourceController);
  });

  it('should return empty data sources with tenant scope', () => {
    const req = { user: { tenantId: 'tenant-1', sub: 'user-1', email: 'a@b.com', role: 'VIEWER' } };
    const result = controller.findAll(req as never);

    expect(result.tenantId).toBe('tenant-1');
    expect(result.dataSources).toEqual([]);
  });
});
