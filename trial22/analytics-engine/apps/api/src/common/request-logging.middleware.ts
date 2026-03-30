import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import { formatLogEntry } from '@repo/shared';

const logger = pino({
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty' }
      : undefined,
});

// TRACED: AE-MON-004
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const correlationId =
      (req.headers['x-correlation-id'] as string) ?? 'unknown';

    res.on('finish', () => {
      const entry = formatLogEntry({
        level: 'info',
        message: `${req.method} ${req.originalUrl} ${res.statusCode}`,
        correlationId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: Date.now() - start,
      });
      logger.info(entry);
    });

    next();
  }
}
