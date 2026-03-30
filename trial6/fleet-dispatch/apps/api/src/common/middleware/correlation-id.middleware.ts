// TRACED:FD-MON-009 — correlation ID middleware preserving client header or generating new
import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { createCorrelationId } from '@fleet-dispatch/shared';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const existing = req.headers['x-correlation-id'] as string | undefined;
    const correlationId = existing ?? createCorrelationId();
    req.headers['x-correlation-id'] = correlationId;
    next();
  }
}
