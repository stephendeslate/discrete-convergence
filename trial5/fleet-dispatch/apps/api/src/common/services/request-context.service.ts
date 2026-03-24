// TRACED:FD-MON-006 — request-scoped context for correlation, user, and tenant
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  correlationId = '';
  userId = '';
  tenantId = '';
}
