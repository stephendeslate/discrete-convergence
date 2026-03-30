import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
// TRACED:AE-MON-001 — CorrelationIdMiddleware uses createCorrelationId from shared
import { createCorrelationId } from '@analytics-engine/shared';
import { RequestContextService } from '../monitoring/request-context.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ?? createCorrelationId();
    this.requestContext.correlationId = correlationId;
    next();
  }
}
