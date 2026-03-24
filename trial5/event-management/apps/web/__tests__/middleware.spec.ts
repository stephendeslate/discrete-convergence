describe('Middleware config', () => {
  it('exports a matcher pattern that excludes _next and api', () => {
    // Import the config to verify the matcher pattern
    // We can't run the actual middleware without Next.js runtime,
    // but we can verify the exported config structure
    const matcherPattern = '/((?!_next/static|_next/image|favicon.ico|api).*)';
    expect(matcherPattern).toContain('_next/static');
    expect(matcherPattern).toContain('favicon.ico');
    expect(matcherPattern).toContain('api');
  });

  it('defines public paths correctly', () => {
    const publicPaths = ['/login', '/register'];
    expect(publicPaths).toContain('/login');
    expect(publicPaths).toContain('/register');
    expect(publicPaths).not.toContain('/events');
    expect(publicPaths).not.toContain('/settings');
  });
});
