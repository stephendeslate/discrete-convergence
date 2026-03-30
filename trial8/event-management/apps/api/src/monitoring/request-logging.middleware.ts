import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@event-management/shared';
import { LoggerService } from '../infra/logger.service';

// TRACED: EM-MON-006 — Request logging middleware with structured log output
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = performance.now();

    res.on('finish', () => {
      const duration = Math.round(performance.now() - start);
      const correlationId = req.headers['x-correlation-id'] as string | undefined;

      const entry = formatLogEntry({
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        correlationId,
      });

      this.logger.log(JSON.stringify(entry), 'HTTP');
    });

    next();
  }
}
