import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createCorrelationId } from '@fleet-dispatch/shared';
import { RequestContextService } from './request-context.service';
import { performance } from 'perf_hooks';

// TRACED: FD-MON-007
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ?? createCorrelationId();
    this.requestContext.setCorrelationId(correlationId);
    res.setHeader('x-correlation-id', correlationId);
    (req as unknown as { __startTime: number }).__startTime = performance.now();
    next();
  }
}
