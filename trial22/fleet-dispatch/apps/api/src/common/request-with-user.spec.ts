import { JwtPayload, RequestWithUser } from './request-with-user';

describe('RequestWithUser interfaces', () => {
  it('should allow creating a valid JwtPayload object', () => {
    const payload: JwtPayload = {
      sub: 'user-1',
      email: 'test@example.com',
      role: 'admin',
      tenantId: 'tenant-1',
    };

    expect(payload.sub).toBe('user-1');
    expect(payload.tenantId).toBe('tenant-1');
  });

  it('should allow creating a RequestWithUser with user property', () => {
    const req = {
      user: {
        sub: 'user-2',
        email: 'user@test.com',
        role: 'driver',
        tenantId: 'tenant-2',
      },
    } as unknown as RequestWithUser;

    expect(req.user).toBeDefined();
    expect(req.user.role).toBe('driver');
  });
});
