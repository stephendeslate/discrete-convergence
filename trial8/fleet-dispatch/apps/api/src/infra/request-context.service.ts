import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private correlationId: string = '';
  private tenantId: string = '';

  setCorrelationId(id: string) {
    this.correlationId = id;
  }

  getCorrelationId(): string {
    return this.correlationId;
  }

  setTenantId(id: string) {
    this.tenantId = id;
  }

  getTenantId(): string {
    return this.tenantId;
  }
}
