// TRACED:AUTH-UTILS-TEST — Auth utils tests
import { extractAuthUser, isAdmin, canEdit, AuthUser } from './auth-utils';
import { Request } from 'express';

describe('auth-utils', () => {
  const mockUser: AuthUser = {
    userId: '1',
    tenantId: 'tenant-1',
    email: 'admin@test.com',
    role: 'ADMIN',
  };

  it('should extract auth user from request', () => {
    const req = { user: mockUser } as unknown as Request;
    expect(extractAuthUser(req)).toEqual(mockUser);
  });

  it('should throw if no user on request', () => {
    const req = {} as Request;
    expect(() => extractAuthUser(req)).toThrow('No authenticated user');
  });

  it('should identify admin users', () => {
    expect(isAdmin(mockUser)).toBe(true);
    expect(isAdmin({ ...mockUser, role: 'VIEWER' })).toBe(false);
  });

  it('should identify users with edit permissions', () => {
    expect(canEdit(mockUser)).toBe(true);
    expect(canEdit({ ...mockUser, role: 'EDITOR' })).toBe(true);
    expect(canEdit({ ...mockUser, role: 'VIEWER' })).toBe(false);
  });
});
