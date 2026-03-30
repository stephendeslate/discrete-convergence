// TRACED:JWT-STRAT-TEST — JWT strategy tests
import { JwtStrategy } from './jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env['JWT_SECRET'] = 'test-secret';
    strategy = new JwtStrategy();
  });

  it('should validate a valid payload', () => {
    const result = strategy.validate({
      sub: '1',
      email: 'test@test.com',
      tenantId: 'tenant-1',
      role: 'ADMIN',
    });
    expect(result.userId).toBe('1');
    expect(result.tenantId).toBe('tenant-1');
    expect(result.email).toBe('test@test.com');
    expect(result.role).toBe('ADMIN');
  });

  it('should throw for missing sub', () => {
    expect(() =>
      strategy.validate({
        sub: '',
        email: 'test@test.com',
        tenantId: 'tenant-1',
        role: 'ADMIN',
      }),
    ).toThrow(UnauthorizedException);
    expect(() =>
      strategy.validate({
        sub: '',
        email: 'test@test.com',
        tenantId: 'tenant-1',
        role: 'ADMIN',
      }),
    ).toThrow();
  });
});
