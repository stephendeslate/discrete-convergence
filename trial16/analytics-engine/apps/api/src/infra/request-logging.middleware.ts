import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import { formatLogEntry } from '@analytics-engine/shared';

// TRACED: AE-MON-003 — RequestLoggingMiddleware logs method, URL, status, duration, correlationId using formatLogEntry from shared

const logger = pino({ level: 'info' });

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const correlationId =
        (req.headers['x-correlation-id'] as string) ?? 'unknown';

      const entry = formatLogEntry({
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        correlationId,
      });

      logger.info(entry);
    });

    next();
  }
}
