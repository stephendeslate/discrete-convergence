// TRACED: FD-AUTH-001 — JWT strategy unit tests
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key-for-jest';
    strategy = new JwtStrategy();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return user payload', () => {
    const payload = {
      sub: 'user-1',
      email: 'test@example.com',
      tenantId: 'tenant-1',
      role: 'admin',
    };

    const result = strategy.validate(payload);

    expect(result).toEqual({
      userId: 'user-1',
      email: 'test@example.com',
      tenantId: 'tenant-1',
      role: 'admin',
    });
  });

  it('should map sub field to userId in output', () => {
    const payload = { sub: 'u99', email: 'x@y.com', tenantId: 't1', role: 'viewer' };
    const result = strategy.validate(payload);

    expect(result.userId).toBe('u99');
    expect((result as Record<string, unknown>)['sub']).toBeUndefined();
  });
});
