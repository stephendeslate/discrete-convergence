import { JwtService } from '@nestjs/jwt';

export function createTestToken(
  jwtService: JwtService,
  overrides: Partial<{
    sub: string;
    email: string;
    role: string;
    tenantId: string;
  }> = {},
): string {
  return jwtService.sign({
    sub: overrides.sub ?? 'test-user-id',
    email: overrides.email ?? 'test@test.com',
    role: overrides.role ?? 'ADMIN',
    tenantId: overrides.tenantId ?? 'test-tenant-id',
  });
}
