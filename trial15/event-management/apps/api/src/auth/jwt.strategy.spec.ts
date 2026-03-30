jest.mock('@event-management/shared', () => ({
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
}));

import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    strategy = new JwtStrategy();
  });

  it('should return payload with sub, email, role, tenantId', () => {
    const payload = { sub: 'u1', email: 'a@b.com', role: 'ADMIN', tenantId: 't1' };

    const result = strategy.validate(payload);

    expect(result).toEqual(payload);
    // Behavioral: validate must extract exactly these fields
    expect(result).toEqual(
      expect.objectContaining({ sub: 'u1', email: 'a@b.com', role: 'ADMIN', tenantId: 't1' }),
    );
  });
});
