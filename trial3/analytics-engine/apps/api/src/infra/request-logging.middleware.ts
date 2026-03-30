// TRACED:AE-MON-005 — RequestLoggingMiddleware with formatLogEntry
import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import { formatLogEntry } from '@analytics-engine/shared';
import { PinoLoggerService } from './pino-logger.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(
    @Inject(PinoLoggerService) private readonly logger: PinoLoggerService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = performance.now();

    res.on('finish', () => {
      const duration = performance.now() - start;
      const correlationId = req.headers['x-correlation-id'] as string;

      this.logger.info(
        formatLogEntry({
          level: 'info',
          message: `${req.method} ${req.url} ${res.statusCode}`,
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: Math.round(duration),
          correlationId,
        }),
      );
    });

    next();
  }
}
