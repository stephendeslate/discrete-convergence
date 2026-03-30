import { RequestUser, RequestWithUser } from './request-with-user';

describe('RequestWithUser', () => {
  it('should allow creating a RequestUser object matching the interface', () => {
    const user: RequestUser = {
      userId: 'user-1',
      email: 'test@example.com',
      tenantId: 'tenant-1',
      role: 'admin',
    };

    expect(user.userId).toBe('user-1');
    expect(user.role).toBe('admin');
  });

  it('should define RequestWithUser type with user property', () => {
    const req = {
      user: {
        userId: 'user-2',
        email: 'user@example.com',
        tenantId: 'tenant-2',
        role: 'member',
      },
    } as unknown as RequestWithUser;

    expect(req.user).toBeDefined();
    expect(req.user.tenantId).toBe('tenant-2');
  });
});
