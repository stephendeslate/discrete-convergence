import { RequestUser, RequestWithUser } from './request-with-user';

describe('RequestWithUser interface', () => {
  it('should allow constructing a valid RequestUser object', () => {
    const user: RequestUser = {
      userId: 'user-1',
      email: 'test@example.com',
      tenantId: 'tenant-1',
      role: 'ADMIN',
    };

    expect(user.userId).toBe('user-1');
    expect(user.role).toBe('ADMIN');
  });

  it('should allow assigning a user to a RequestWithUser-shaped object', () => {
    const reqWithUser: Pick<RequestWithUser, 'user'> = {
      user: {
        userId: 'user-2',
        email: 'admin@example.com',
        tenantId: 'tenant-2',
        role: 'VIEWER',
      },
    };

    expect(reqWithUser.user).toBeDefined();
    expect(reqWithUser.user.tenantId).toBe('tenant-2');
  });
});
