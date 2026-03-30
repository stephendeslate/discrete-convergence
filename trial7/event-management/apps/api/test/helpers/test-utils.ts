import { JwtService } from '@nestjs/jwt';

export function createTestToken(
  jwtService: JwtService,
  payload: { sub: string; email: string; role: string; tenantId: string },
): string {
  return jwtService.sign(payload);
}

export const TEST_TENANT_ID = 'test-tenant-001';
export const TEST_USER_ID = 'test-user-001';
export const TEST_ADMIN_ID = 'test-admin-001';
