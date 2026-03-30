// TRACED: EM-MON-007
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@event-management/shared';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const correlationId = req.headers['x-correlation-id'] as string;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const logMessage = formatLogEntry({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'HTTP Request',
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        correlationId,
      });
      this.logger.log(logMessage);
    });

    next();
  }
}
