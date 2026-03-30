import { Injectable, Scope } from '@nestjs/common';

// TRACED:EM-MON-003
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  correlationId = '';
  userId = '';
  tenantId = '';
}
