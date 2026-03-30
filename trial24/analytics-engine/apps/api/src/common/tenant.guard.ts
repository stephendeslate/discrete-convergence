// TRACED:TENANT-GUARD — Enforces tenant isolation via RLS
import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { tenantId?: string } | undefined;

    if (user?.tenantId) {
      await this.prisma.setTenantId(user.tenantId);
    }

    return true;
  }
}
