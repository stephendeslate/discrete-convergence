import { Injectable, Scope } from '@nestjs/common';

/**
 * Request-scoped service that holds context for the current request.
 * Stores correlationId, userId, and tenantId for use across the request lifecycle.
 */
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  correlationId: string = '';
  userId: string = '';
  tenantId: string = '';
}
