import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  correlationId: string = '';
  userId: string = '';
  organizationId: string = '';
}
