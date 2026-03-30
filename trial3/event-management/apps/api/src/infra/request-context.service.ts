// TRACED:EM-MON-002
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  correlationId = '';
  userId = '';
  tenantId = '';
}
