import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createCorrelationId } from '@analytics-engine/shared';

// TRACED: AE-MON-002 — CorrelationIdMiddleware preserves client X-Correlation-ID or generates UUID via createCorrelationId from shared

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const existingId = req.headers['x-correlation-id'] as string | undefined;
    const correlationId = existingId ?? createCorrelationId();
    req.headers['x-correlation-id'] = correlationId;
    next();
  }
}
