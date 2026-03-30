import { Injectable, Scope } from '@nestjs/common';

// TRACED:AE-MON-004 — RequestContextService is request-scoped for correlation tracking
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  correlationId = '';
  userId = '';
  tenantId = '';
}
