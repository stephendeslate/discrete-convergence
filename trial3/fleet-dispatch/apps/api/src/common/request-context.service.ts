import { Injectable, Scope } from '@nestjs/common';

// TRACED:FD-MON-006
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  correlationId: string = '';
  userId: string = '';
  tenantId: string = '';
}
