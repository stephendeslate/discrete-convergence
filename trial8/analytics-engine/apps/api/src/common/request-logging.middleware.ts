// TRACED:AE-MON-001 — Request logging with Pino structured JSON via formatLogEntry from shared
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import { formatLogEntry } from '@analytics-engine/shared';

const logger = pino({ level: 'info' });

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const correlationId = (res.getHeader('X-Correlation-ID') as string) ?? '';
      const entry = formatLogEntry('info', 'request completed', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        correlationId,
      });
      logger.info(entry);
    });
    next();
  }
}
