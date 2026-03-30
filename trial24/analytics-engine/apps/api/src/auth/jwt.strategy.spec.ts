// TRACED:JWT-STRATEGY-SPEC

describe('JwtStrategy', () => {
  const originalEnv = process.env.JWT_SECRET;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.JWT_SECRET = originalEnv;
    } else {
      delete process.env.JWT_SECRET;
    }
    jest.resetModules();
  });

  it('should throw if JWT_SECRET is not set', () => {
    delete process.env.JWT_SECRET;
    jest.resetModules();
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { JwtStrategy } = require('./jwt.strategy');
      new JwtStrategy();
    }).toThrow('JWT_SECRET environment variable is required');
  });

  it('should construct successfully when JWT_SECRET is set', () => {
    process.env.JWT_SECRET = 'test-secret-key';
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { JwtStrategy } = require('./jwt.strategy');
    const strategy = new JwtStrategy();
    expect(strategy).toBeDefined();
  });

  it('should validate a valid payload', () => {
    process.env.JWT_SECRET = 'test-secret-key';
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { JwtStrategy } = require('./jwt.strategy');
    const strategy = new JwtStrategy();
    const payload = { sub: 'u-1', email: 'a@b.com', role: 'VIEWER', tenantId: 't-1' };
    expect(strategy.validate(payload)).toEqual(payload);
  });

  it('should throw UnauthorizedException for missing sub', () => {
    process.env.JWT_SECRET = 'test-secret-key';
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { JwtStrategy } = require('./jwt.strategy');
    const strategy = new JwtStrategy();
    expect(() => strategy.validate({ sub: '', email: 'a@b.com', role: 'VIEWER', tenantId: 't-1' }))
      .toThrow('Invalid token payload');
  });

  it('should throw UnauthorizedException for missing tenantId', () => {
    process.env.JWT_SECRET = 'test-secret-key';
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { JwtStrategy } = require('./jwt.strategy');
    const strategy = new JwtStrategy();
    expect(() => strategy.validate({ sub: 'u-1', email: 'a@b.com', role: 'VIEWER', tenantId: '' }))
      .toThrow('Invalid token payload');
  });
});
