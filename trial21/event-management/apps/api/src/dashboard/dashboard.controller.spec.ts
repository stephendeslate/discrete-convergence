import { DashboardController } from './dashboard.controller';

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(() => {
    controller = new DashboardController();
  });

  it('should return empty array', () => {
    const result = controller.findAll();
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });
});
