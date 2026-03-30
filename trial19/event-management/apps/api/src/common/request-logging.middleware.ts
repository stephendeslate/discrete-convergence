import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatLogEntry } from '@event-management/shared';

// TRACED: EM-MON-007
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on('finish', () => {
      const entry = formatLogEntry({
        level: 'info',
        message: `${req.method} ${req.originalUrl}`,
        timestamp: new Date().toISOString(),
        correlationId: req.headers['x-correlation-id'] as string,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: Date.now() - start,
      });
      process.stdout.write(entry + '\n');
    });
    next();
  }
}
