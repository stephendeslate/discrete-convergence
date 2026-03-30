import { Injectable, Scope } from '@nestjs/common';

// TRACED: FD-MON-006
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private correlationId = '';
  private userId = '';
  private tenantId = '';

  setCorrelationId(id: string): void {
    this.correlationId = id;
  }

  getCorrelationId(): string {
    return this.correlationId;
  }

  setUserId(id: string): void {
    this.userId = id;
  }

  getUserId(): string {
    return this.userId;
  }

  setTenantId(id: string): void {
    this.tenantId = id;
  }

  getTenantId(): string {
    return this.tenantId;
  }
}
