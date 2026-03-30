// TRACED:AE-MON-002 — RequestContextService (request-scoped)
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  correlationId = '';
  userId = '';
  tenantId = '';
}
