import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createCorrelationId } from '@fleet-dispatch/shared';
import { RequestContextService } from './request-context.service';

/**
 * Middleware that preserves client X-Correlation-ID or generates a new one.
 * TRACED:FD-MON-002
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ?? createCorrelationId();
    this.requestContext.correlationId = correlationId;
    _res.setHeader('x-correlation-id', correlationId);
    next();
  }
}
