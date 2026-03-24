// TRACED:EM-MON-003 — CorrelationIdMiddleware preserves or generates correlation ID
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createCorrelationId } from '@event-management/shared';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    if (!req.headers['x-correlation-id']) {
      req.headers['x-correlation-id'] = createCorrelationId();
    }
    next();
  }
}
