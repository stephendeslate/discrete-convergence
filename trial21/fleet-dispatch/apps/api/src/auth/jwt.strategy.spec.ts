import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });

  it('should validate and return payload', () => {
    const payload = {
      sub: 'user-1',
      email: 'test@test.com',
      role: 'ADMIN',
      companyId: 'comp-1',
      tenantId: 'tenant-1',
    };

    const result = strategy.validate(payload);
    expect(result.sub).toBe('user-1');
    expect(result.email).toBe('test@test.com');
  });

  it('should throw for payload without sub', () => {
    expect(() =>
      strategy.validate({
        sub: '',
        email: 'test@test.com',
        role: 'ADMIN',
        companyId: 'comp-1',
        tenantId: 'tenant-1',
      }),
    ).toThrow('Invalid token payload');
  });
});
