// Unit tests
import { getAuthUser } from './auth-utils';

describe('getAuthUser', () => {
  it('should return authenticated user from request', () => {
    const mockRequest = {
      user: { userId: 'u1', tenantId: 't1', role: 'ADMIN', email: 'admin@test.com' },
    } as never;

    const result = getAuthUser(mockRequest);
    expect(result.userId).toBe('u1');
    expect(result.tenantId).toBe('t1');
  });

  it('should throw error when user is not authenticated', () => {
    const mockRequest = { user: undefined } as never;
    expect(() => getAuthUser(mockRequest)).toThrow('User not authenticated');
  });

  it('should throw error when request has no user property', () => {
    const mockRequest = {} as never;
    expect(() => getAuthUser(mockRequest)).toThrow('User not authenticated');
  });
});
