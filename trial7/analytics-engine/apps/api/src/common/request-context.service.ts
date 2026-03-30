import { Injectable, Scope } from '@nestjs/common';

// TRACED:AE-MON-004
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  correlationId: string = '';
  userId: string = '';
  tenantId: string = '';
}
