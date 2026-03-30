// TRACED:FD-AUTH-011 — @CompanyId() parameter decorator extracts tenant ID from JWT
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface AuthenticatedUser {
  companyId: string;
}

export const CompanyId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return (request.user as AuthenticatedUser).companyId;
  },
);
