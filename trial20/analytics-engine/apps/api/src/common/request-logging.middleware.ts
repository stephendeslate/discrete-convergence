import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@analytics-engine/shared';
import pino from 'pino';

const logger = pino({ level: 'info' });

// TRACED: AE-MON-006
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const correlationId = req.headers['x-correlation-id'] as string;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const entry = formatLogEntry('info', `${req.method} ${req.url}`, {
        correlationId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
      });
      logger.info(entry);
    });

    next();
  }
}
