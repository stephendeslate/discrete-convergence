// TRACED:AE-MON-001 — Request logging with Pino structured JSON via formatLogEntry from shared
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import { formatLogEntry } from '@repo/shared';
import { RequestContextService } from './request-context.service';

const logger = pino({
  level: 'info',
  transport: process.env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
});

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const entry = formatLogEntry('info', 'request completed', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        correlationId: this.requestContext.correlationId,
      });
      logger.info(entry);
    });
    next();
  }
}
