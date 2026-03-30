import { Injectable, Scope } from '@nestjs/common';

// TRACED:AE-MON-004 — Request-scoped context for correlation, user, and tenant tracking
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  correlationId = '';
  userId: string | undefined;
  tenantId: string | undefined;
}
