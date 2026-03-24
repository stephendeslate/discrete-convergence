// TRACED:FD-MON-005
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private correlationId = '';
  private userId = '';
  private companyId = '';

  setCorrelationId(id: string) { this.correlationId = id; }
  getCorrelationId(): string { return this.correlationId; }

  setUserId(id: string) { this.userId = id; }
  getUserId(): string { return this.userId; }

  setCompanyId(id: string) { this.companyId = id; }
  getCompanyId(): string { return this.companyId; }
}
