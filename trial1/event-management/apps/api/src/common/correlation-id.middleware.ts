// TRACED:EM-MON-002 — Correlation ID middleware with createCorrelationId
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createCorrelationId } from '@event-management/shared';
import { RequestContextService } from './request-context.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly context: RequestContextService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const correlationId = (req.headers['x-correlation-id'] as string) ?? createCorrelationId();
    this.context.correlationId = correlationId;
    next();
  }
}
