import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@analytics-engine/shared';
import pino from 'pino';

const logger = pino({ name: 'request-logger' });

// TRACED: AE-MON-008
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const entry = formatLogEntry({
        level: 'info',
        message: `${req.method} ${req.originalUrl}`,
        correlationId: req.headers['x-correlation-id'] as string,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
      });
      logger.info(entry);
    });

    next();
  }
}
