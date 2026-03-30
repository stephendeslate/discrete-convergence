import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createCorrelationId } from '@event-management/shared';

// TRACED: EM-MON-006
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const existingId = req.headers['x-correlation-id'] as string | undefined;
    const correlationId = existingId ?? createCorrelationId();
    req.headers['x-correlation-id'] = correlationId;
    next();
  }
}
