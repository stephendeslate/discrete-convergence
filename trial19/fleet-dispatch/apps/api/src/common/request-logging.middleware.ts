import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import { formatLogEntry } from '@fleet-dispatch/shared';

const logger = pino();

// TRACED: FD-MON-003
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    // TRACED: FD-MON-007
    res.on('finish', () => {
      const duration = Date.now() - start;
      const correlationId = req.headers['x-correlation-id'] as string;

      const entry = formatLogEntry({
        timestamp: new Date().toISOString(),
        level: 'info',
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        correlationId,
      });

      logger.info(JSON.parse(entry), 'request completed');
    });

    next();
  }
}
