// TRACED:TEST-WEB-ACTIONS — Tests for server actions
describe('Server Actions', () => {
  it('should export login action', async () => {
    const actions = await import('../lib/actions');
    expect(typeof actions.loginAction).toBe('function');
    expect(actions.loginAction).toBeDefined();
  });

  it('should export register action', async () => {
    const actions = await import('../lib/actions');
    expect(typeof actions.registerAction).toBe('function');
    expect(actions.registerAction).toBeDefined();
  });

  it('should export createDashboardAction', async () => {
    const actions = await import('../lib/actions');
    expect(typeof actions.createDashboardAction).toBe('function');
    expect(actions.createDashboardAction).toBeDefined();
  });

  it('should export createDataSourceAction', async () => {
    const actions = await import('../lib/actions');
    expect(typeof actions.createDataSourceAction).toBe('function');
    expect(actions.createDataSourceAction).toBeDefined();
  });

  it('should export createWidgetAction', async () => {
    const actions = await import('../lib/actions');
    expect(typeof actions.createWidgetAction).toBe('function');
    expect(actions.createWidgetAction).toBeDefined();
  });
});
