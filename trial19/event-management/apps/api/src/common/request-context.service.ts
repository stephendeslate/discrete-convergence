import { Injectable, Scope } from '@nestjs/common';

// TRACED: EM-MON-008
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  correlationId: string = '';
  userId: string = '';
  tenantId: string = '';
}
