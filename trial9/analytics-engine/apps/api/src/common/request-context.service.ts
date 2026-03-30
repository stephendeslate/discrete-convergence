import { Injectable, Scope } from '@nestjs/common';

// TRACED: AE-MON-007
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  correlationId = '';
  userId = '';
  tenantId = '';
}
