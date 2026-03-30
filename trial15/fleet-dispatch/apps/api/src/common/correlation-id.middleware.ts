import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createCorrelationId } from '@fleet-dispatch/shared';
import { performance } from 'perf_hooks';

// TRACED: FD-MON-005
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ?? createCorrelationId();
    req.headers['x-correlation-id'] = correlationId;
    (req as Request & { startTime: number }).startTime = performance.now();
    next();
  }
}
