// TRACED:AE-MON-003 — CorrelationIdMiddleware preserves or generates correlation ID
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createCorrelationId } from '@analytics-engine/shared';
import { RequestContextService } from './request-context.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ?? createCorrelationId();
    this.requestContext.setCorrelationId(correlationId);
    next();
  }
}
