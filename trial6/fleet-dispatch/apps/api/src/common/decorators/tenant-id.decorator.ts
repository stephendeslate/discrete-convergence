import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

interface JwtUser {
  sub: string;
  tenantId: string;
  role: string;
}

export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as JwtUser | undefined;
    return user?.tenantId ?? '';
  },
);
