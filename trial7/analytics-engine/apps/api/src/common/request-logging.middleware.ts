import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@analytics-engine/shared';
import { LoggerService } from '../infra/logger.service';

// TRACED:AE-MON-003
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const correlationId =
        (req.headers['x-correlation-id'] as string) ?? 'unknown';

      const entry = formatLogEntry({
        level: 'info',
        message: `${req.method} ${req.originalUrl} ${res.statusCode}`,
        correlationId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
      });

      this.logger.log(JSON.stringify(entry));
    });

    next();
  }
}
