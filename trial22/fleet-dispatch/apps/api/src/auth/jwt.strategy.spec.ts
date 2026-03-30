import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { JwtPayload } from '../common/request-with-user';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    strategy = new JwtStrategy();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
    expect(strategy).toBeInstanceOf(JwtStrategy);
  });

  it('should return payload for valid token data', () => {
    const payload: JwtPayload = {
      sub: 'user-1',
      email: 'test@example.com',
      role: 'admin',
      tenantId: 'tenant-1',
    };

    const result = strategy.validate(payload);

    expect(result).toEqual(payload);
    expect(result.sub).toBe('user-1');
  });

  it('should throw UnauthorizedException when sub is missing', () => {
    const payload = {
      sub: '',
      email: 'test@example.com',
      role: 'admin',
      tenantId: 'tenant-1',
    } as JwtPayload;

    expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
    expect(() => strategy.validate(payload)).toThrow('Invalid token payload');
  });

  it('should throw UnauthorizedException when tenantId is missing', () => {
    const payload = {
      sub: 'user-1',
      email: 'test@example.com',
      role: 'admin',
      tenantId: '',
    } as JwtPayload;

    expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
    expect(() => strategy.validate(payload)).toThrow('Invalid token payload');
  });
});
