import { JwtService } from '@nestjs/jwt';

export function createTestToken(
  jwtService: JwtService,
  payload: { sub: string; email: string; role: string; tenantId: string },
): string {
  return jwtService.sign(payload);
}

export const testTenantId = 'test-tenant-001';

export const testUser = {
  sub: 'user-001',
  email: 'test@example.com',
  role: 'USER',
  tenantId: testTenantId,
};

export const testAdmin = {
  sub: 'admin-001',
  email: 'admin@example.com',
  role: 'ADMIN',
  tenantId: testTenantId,
};
