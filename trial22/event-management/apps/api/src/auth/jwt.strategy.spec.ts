import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    strategy = new JwtStrategy();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
    expect(strategy).toBeInstanceOf(JwtStrategy);
  });

  it('should return user object from validate payload', () => {
    const payload = {
      sub: 'user-123',
      email: 'test@example.com',
      tenantId: 'tenant-456',
      role: 'admin',
    };

    const result = strategy.validate(payload);

    expect(result).toEqual({
      userId: 'user-123',
      email: 'test@example.com',
      tenantId: 'tenant-456',
      role: 'admin',
    });
    expect(result.userId).toBe(payload.sub);
  });
});
