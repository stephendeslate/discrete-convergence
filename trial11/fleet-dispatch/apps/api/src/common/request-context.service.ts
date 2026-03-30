import { Injectable, Scope } from '@nestjs/common';

// TRACED: FD-MON-007
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  correlationId: string = '';
  userId: string = '';
  tenantId: string = '';
}
