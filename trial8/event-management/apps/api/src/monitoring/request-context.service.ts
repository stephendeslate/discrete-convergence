import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

// TRACED: EM-MON-004 — Request context using AsyncLocalStorage
interface RequestContext {
  correlationId: string;
  startTime: number;
}

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  run(context: RequestContext, callback: () => void) {
    this.storage.run(context, callback);
  }

  getContext(): RequestContext | undefined {
    return this.storage.getStore();
  }

  getCorrelationId(): string | undefined {
    return this.storage.getStore()?.correlationId;
  }
}
