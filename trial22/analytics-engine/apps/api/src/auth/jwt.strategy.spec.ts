import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, JWT_SECRET: 'test-secret-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should be defined', () => {
    const strategy = new JwtStrategy();
    expect(strategy).toBeDefined();
    expect(strategy).toBeInstanceOf(JwtStrategy);
  });

  it('should extract user fields from JWT payload via validate()', () => {
    const strategy = new JwtStrategy();
    const payload = {
      sub: 'user-123',
      email: 'test@example.com',
      tenantId: 'tenant-456',
      role: 'ADMIN',
    };

    const result = strategy.validate(payload);

    expect(result).toEqual({
      userId: 'user-123',
      email: 'test@example.com',
      tenantId: 'tenant-456',
      role: 'ADMIN',
    });
    expect(result.userId).toBe(payload.sub);
  });
});
