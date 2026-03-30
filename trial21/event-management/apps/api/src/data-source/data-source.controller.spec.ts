import { DataSourceController } from './data-source.controller';

describe('DataSourceController', () => {
  let controller: DataSourceController;

  beforeEach(() => {
    controller = new DataSourceController();
  });

  it('should return empty array', () => {
    const result = controller.findAll();
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });
});
