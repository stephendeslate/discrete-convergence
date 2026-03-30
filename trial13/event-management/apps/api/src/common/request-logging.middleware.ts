import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@event-management/shared';

// TRACED: EM-MON-007
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const correlationId = req.headers['x-correlation-id'] as string;
      const logMessage = formatLogEntry({
        level: 'info',
        message: `${req.method} ${req.url} ${res.statusCode} ${duration}ms`,
        correlationId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
      });
      process.stdout.write(logMessage + '\n');
    });
    next();
  }
}
