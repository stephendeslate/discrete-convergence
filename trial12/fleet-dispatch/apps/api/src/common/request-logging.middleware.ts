// TRACED: FD-MON-008
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@fleet-dispatch/shared';
import pino from 'pino';

interface RequestWithCorrelation extends Request {
  correlationId?: string;
}

const logger = pino({ level: 'info' });

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: RequestWithCorrelation, res: Response, next: NextFunction): void {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logEntry = formatLogEntry({
        level: 'info',
        message: `${req.method} ${req.url} ${res.statusCode}`,
        correlationId: req.correlationId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
      });
      logger.info(logEntry);
    });
    next();
  }
}
