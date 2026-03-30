import { Injectable, Scope } from '@nestjs/common';

// TRACED:FD-MON-003 — RequestContextService (request-scoped) for correlationId, userId, tenantId
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  correlationId: string = '';
  userId: string = '';
  tenantId: string = '';
}
