// TRACED:EM-MON-001 — Pino structured logging in request middleware
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import { formatLogEntry } from '@event-management/shared';
import { RequestContextService } from './request-context.service';

const logger = pino({ level: 'info' });

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly context: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const entry = formatLogEntry({
        level: 'info',
        message: `${req.method} ${req.originalUrl}`,
        correlationId: this.context.correlationId,
        statusCode: res.statusCode,
        duration,
      });
      logger.info(entry);
    });

    next();
  }
}
