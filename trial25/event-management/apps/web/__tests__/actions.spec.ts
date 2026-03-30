// Tests for server actions
describe('Server Actions', () => {
  it('should export login action', async () => {
    const actions = await import('../lib/actions');
    expect(typeof actions.loginAction).toBe('function');
  });

  it('should export register action', async () => {
    const actions = await import('../lib/actions');
    expect(typeof actions.registerAction).toBe('function');
  });

  it('should export createEventAction', async () => {
    const actions = await import('../lib/actions');
    expect(typeof actions.createEventAction).toBe('function');
  });

  it('should export createVenueAction', async () => {
    const actions = await import('../lib/actions');
    expect(typeof actions.createVenueAction).toBe('function');
  });

  it('should export login function', async () => {
    const actions = await import('../lib/actions');
    expect(typeof actions.login).toBe('function');
  });

  it('should export register function', async () => {
    const actions = await import('../lib/actions');
    expect(typeof actions.register).toBe('function');
  });

  it('should export createEvent function', async () => {
    const actions = await import('../lib/actions');
    expect(typeof actions.createEvent).toBe('function');
  });

  it('should export deleteEvent function', async () => {
    const actions = await import('../lib/actions');
    expect(typeof actions.deleteEvent).toBe('function');
  });
});
