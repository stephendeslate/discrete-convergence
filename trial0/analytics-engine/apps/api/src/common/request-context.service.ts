// TRACED:AE-MON-005 — Request-scoped context for correlation, user, tenant
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private correlationId: string = '';
  private userId: string = '';
  private tenantId: string = '';

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
