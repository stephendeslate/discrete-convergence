import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@fleet-dispatch/shared';
import { LoggerService } from '../infra/logger.service';

// TRACED:FD-MON-007
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const correlationId =
        (req.headers['x-correlation-id'] as string) ?? '';
      const entry = formatLogEntry({
        level: 'info',
        message: 'HTTP Request',
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        correlationId,
      });
      this.logger.info(entry);
    });

    next();
  }
}
