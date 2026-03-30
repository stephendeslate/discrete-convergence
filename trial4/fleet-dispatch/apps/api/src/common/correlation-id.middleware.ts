// TRACED:FD-MON-001 — CorrelationIdMiddleware attaches X-Correlation-ID
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createCorrelationId } from '@fleet-dispatch/shared';
import { RequestContextService } from '../monitoring/request-context.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId = (req.headers['x-correlation-id'] as string) ?? createCorrelationId();
    this.requestContext.setCorrelationId(correlationId);
    res.setHeader('X-Correlation-ID', correlationId);
    next();
  }
}
