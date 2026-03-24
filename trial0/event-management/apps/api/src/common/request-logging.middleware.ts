// TRACED:EM-MON-004 — Request logging middleware with structured format
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@event-management/shared';
import { LoggerService } from './logger.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on('finish', () => {
      const entry = formatLogEntry({
        level: 'info',
        message: 'HTTP Request',
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: Date.now() - start,
        correlationId: req.headers['x-correlation-id'] as string,
      });
      this.logger.log(JSON.stringify(entry));
    });
    next();
  }
}
