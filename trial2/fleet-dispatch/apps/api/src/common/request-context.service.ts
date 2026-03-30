import { Injectable, Scope } from '@nestjs/common';

/**
 * Request-scoped context for correlation IDs, user info, and tenant info.
 * TRACED:FD-MON-003
 */
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  correlationId = '';
  userId = '';
  tenantId = '';
}
