// TRACED:TEST-AUTH-UTILS — Auth utility unit tests
// VERIFY:FD-UTIL-001 — extractUserFromRequest returns authenticated user
// VERIFY:FD-UTIL-002 — extractUserFromRequest throws when no user
// VERIFY:FD-UTIL-003 — requireRole allows permitted roles
// VERIFY:FD-UTIL-004 — requireRole rejects unauthorized roles
import { UnauthorizedException } from '@nestjs/common';
import { extractUserFromRequest, requireRole } from './auth-utils';

describe('Auth Utils', () => {
  describe('extractUserFromRequest', () => {
    it('should extract user from request', () => {
      const mockRequest = {
        user: { userId: 'u1', email: 'a@b.com', role: 'ADMIN', tenantId: 't1' },
      } as never;
      const user = extractUserFromRequest(mockRequest);
      expect(user.userId).toBe('u1');
      expect(user.tenantId).toBe('t1');
    });

    it('should throw if user is not set', () => {
      const mockRequest = {} as never;
      expect(() => extractUserFromRequest(mockRequest)).toThrow(UnauthorizedException);
    });
  });

  describe('requireRole', () => {
    const user = { userId: 'u1', email: 'a@b.com', role: 'VIEWER', tenantId: 't1' };

    it('should not throw for allowed role', () => {
      expect(() => requireRole(user, ['VIEWER', 'ADMIN'])).not.toThrow();
    });

    it('should throw for disallowed role', () => {
      expect(() => requireRole(user, ['ADMIN'])).toThrow(UnauthorizedException);
    });
  });
});
